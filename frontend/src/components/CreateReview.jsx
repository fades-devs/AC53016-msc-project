
import {useState, useEffect} from 'react';

import { Link, useParams, useNavigate } from 'react-router-dom';

import axios from 'axios';
import {
  Box, Button, TextField, Typography, Paper, Stack, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Alert, Collapse, InputLabel,
  Select, MenuItem, IconButton, Grid, CircularProgress,
} from '@mui/material';

import {
    AddCircleOutline as AddCircleOutlineIcon,
    RemoveCircleOutline as RemoveCircleOutlineIcon,
    CloudUpload as CloudUploadIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import { themes } from '../constants/filterOptions';

// Consistent wrapper for each major section of the form
const FormSection = ({ title, step, children, ...props }) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }} {...props}>
    <Typography variant="h6" component="h2" gutterBottom>
      {step}. {title}
    </Typography>
    {/* Consistent vertical spacing for all direct children */}
    <Stack spacing={3}>
      {children}
    </Stack>
  </Paper>
);


const CreateReview = () => {

    // Custom hook for debouncing input
    const useDebounce = (value, delay) => {
        const [debValue, setDebValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debValue;
    };

    // Get module code from URL if present
    const { moduleCode: paramModuleCode } = useParams();
    
    // FOR NAVIGATION TO SUBMIT ROUTE AFTER SUBMISSION
    const navigate = useNavigate();

    // State for the module lookup
    const [moduleCode, setModuleCode] = useState(paramModuleCode || ''); // Pre-fill if it's in the URL
    const [foundModule, setFoundModule] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    // --- State for the previous report year filter ---
    const [previousYear, setPreviousYear] = useState(new Date().getFullYear() - 1);

    // State for the review form fields
    const [enhanceUpdate, setEnhanceUpdate] = useState('')
    const [studentAttainment, setStudentAttainment] = useState('')
    const [moduleFeedback, setModuleFeedback] = useState('')
    const [goodPractice, setGoodPractice] = useState([{theme: '', description: ''}])
    const [risks, setRisks] = useState([{theme: '', description: ''}])
    const [hasEnhancePlans, setHasEnhancePlans] = useState(false);
    const [enhancePlans, setEnhancePlans] = useState([{theme: '', description: ''}])

    // --- State for added DB fields ---
    const [statementEngagement, setStatementEngagement] = useState('');
    const [statementLearning, setStatementLearning] = useState('');
    const [statementTimetable, setStatementTimetable] = useState('');
    const [completedBy, setCompletedBy] = useState('');

    // State for form submission
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // STATE FOR SAVE DRAFT SUCCESS MESSAGE
    const [saveSuccess, setSaveSuccess] = useState('');

    // State for file uploads
    const [evidenceUpload, setEvidenceUpload] = useState(null);
    const [feedbackUpload, setFeedbackUpload] = useState(null);

    // Debounce the module code input to prevent API calls on every keystroke
    const debModuleCode = useDebounce(moduleCode, 500) // 500ms delay

    // Effect to trigger the module lookup when the debounced code changes
    useEffect(() => {
        const moduleLookup = async () => {
            if (!debModuleCode) {
                setFoundModule(null);
                setLookupError('');
                return;
            }
            setLookupLoading(true);
            setLookupError('');
            setFoundModule(null);

            try {
                // Use the new API endpoint structure
                const response = await axios.get(`http://localhost:5000/api/modules/${debModuleCode}`);

                setFoundModule(response.data);

                // If an existing review was found, set the error message
                if (response.data.existingReviewId) {
                    setLookupError(`A review for this module has already been submitted for ${new Date().getFullYear()}.`)
                }

            }
            catch (err) {
                setFoundModule(null);
                if (err.response && err.response.status === 404) {setLookupError('Module not found. Please check the code.');}
                else {setLookupError('An error occurred while searching for the module.');}
            }
            finally {
                setLookupLoading(false);
            }

        };

        moduleLookup();

    }, [debModuleCode])


    // Handler functions for the dynamic fields
    // Update the state when a user types in a description or selects a theme
    const handleThemedPointChange = (index, event, field, setter) => {
        const { name, value } = event.target;
        const list = [...field];
        list[index][name] = value;
        setter(list);
    };
    // Add a new empty row when the Add button is clicked
    const handleAddThemedPoint = (setter, field) => {
        setter([...field, { theme: '', description: '' }]);
    };
    // Remove a specific row when the remove icon is clicked
    const handleRemoveThemedPoint = (index, setter, field) => {
        if (field.length <= 1) return; // Prevent removing last item
        const list = [...field];
        list.splice(index, 1);
        setter(list);
    };

    // Handler to view the previous year's report
    const handleViewPreviousReport = () => {
        // Guard clause to ensure module code is entered
        if (!moduleCode.trim()) {
            setLookupError("Please enter a module code to view its previous report.");
            return;
        }
        // Construct the URL and open it in a new tab
        const url = `/get-review?code=${moduleCode}&year=${previousYear}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // FUNCTION TO RESET THE FORM AFTER SUBMISSION
    const resetForm = () => {
        setModuleCode('');
        setFoundModule(null);
        setLookupError('');
        
        setEnhanceUpdate('');
        setStudentAttainment('');
        setModuleFeedback('');
        setGoodPractice([{ theme: '', description: '' }]);
        setRisks([{ theme: '', description: '' }]);
        setHasEnhancePlans(false);
        setEnhancePlans([{ theme: '', description: '' }]);
        setStatementEngagement('');
        setStatementLearning('');
        setStatementTimetable('');
        setCompletedBy('');

        setEvidenceUpload(null);
        setFeedbackUpload(null);

        setSubmitError('');
        setSubmitSuccess(false); // hide the success message

        // NAVIGATE TO SUBMIT PAGE
        navigate('/create-review');
    };
    
    // --- Submission handler includes all new fields + FILE UPLOADS ---
    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!foundModule) {
            setSubmitError('You must find and select a valid module before submitting.');
            return;
        }
        setSubmitLoading(true);
        setSubmitError('');
        setSubmitSuccess(false);

        // CREATE FormData object
        const formData = new FormData();
        // Append all texts and array data
        formData.append('moduleId', foundModule._id);
        formData.append('enhanceUpdate', enhanceUpdate);
        formData.append('studentAttainment', studentAttainment);
        formData.append('moduleFeedback', moduleFeedback);
        formData.append('completedBy', completedBy);
        formData.append('statementEngagement', statementEngagement);
        formData.append('statementLearning', statementLearning);
        formData.append('statementTimetable', statementTimetable);
        formData.append('goodPractice', JSON.stringify(goodPractice.filter(p => p.theme && p.description)));
        formData.append('risks', JSON.stringify(risks.filter(p => p.theme && p.description)));
        // Only include enhancement plans if user chooses Yes
        formData.append('enhancePlans', JSON.stringify(hasEnhancePlans ? enhancePlans.filter(p => p.theme && p.description) : []));

        // Append files if exists
        if (evidenceUpload) {
            formData.append('evidenceUpload', evidenceUpload);
        }
        if (feedbackUpload) {
            formData.append('feedbackUpload', feedbackUpload);
        }

        try {
            
            // Axios will automatically set the correct 'Content-Type' header
            await axios.post('http://localhost:5000/api/reviews', formData);
            setSubmitSuccess(true);
        }
        catch (err) {
            setSubmitError('Failed to submit the review. Please try again.');
            console.error(err);
        }
        finally {
            setSubmitLoading(false);
        }
    };

    // PARTIAL SAVE DRAFT HANDLER
    const handleSaveDraft = async(e) => {
        if (!foundModule) {
            setSubmitError('You must find and select a valid module before saving a review draft.');
            return;
        }
        setSubmitLoading(true);
        setSubmitError('');
        setSaveSuccess(false); // Clear previous messages

        // CREATE FormData object
        const formData = new FormData();

        // Append all texts and array data
        formData.append('moduleId', foundModule._id);
        formData.append('enhanceUpdate', enhanceUpdate);
        formData.append('studentAttainment', studentAttainment);
        formData.append('moduleFeedback', moduleFeedback);
        formData.append('completedBy', completedBy);
        formData.append('statementEngagement', statementEngagement);
        formData.append('statementLearning', statementLearning);
        formData.append('statementTimetable', statementTimetable);
        formData.append('goodPractice', JSON.stringify(goodPractice.filter(p => p.theme && p.description)));
        formData.append('risks', JSON.stringify(risks.filter(p => p.theme && p.description)));
        // Only include enhancement plans if user chooses Yes
        formData.append('enhancePlans', JSON.stringify(hasEnhancePlans ? enhancePlans.filter(p => p.theme && p.description) : []));

        // Append files if exists
        if (evidenceUpload) {
            formData.append('evidenceUpload', evidenceUpload);
        }
        if (feedbackUpload) {
            formData.append('feedbackUpload', feedbackUpload);
        }

        try {
            await axios.post('http://localhost:5000/api/reviews/draft', formData);
            setSaveSuccess('Draft saved successfully! You will be redirected to the review page.');

            // After the draft is created, go to the view report page based on module code
            setTimeout(() => {
                // navigate to the edit review page of that review after 2 seconds
                navigate(`/get-review?code=${debModuleCode}`);
            }, 2000);
        }

        catch (err) {
            setSubmitError('Failed to save the draft review. Please try again.');
            console.error(err);
        }
        finally {
            setSubmitLoading(false);
        }
    };

    // This success message is styled to be cleaner and centered
    if (submitSuccess) {
        return (
            <Box textAlign="center" sx={{ py: { xs: 4, md: 8 } }}>
                <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main' }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    Review Submitted!
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}>
                    Thank you. Your module review has been successfully submitted.
                </Typography>
                <Button variant="contained" onClick={resetForm}>
                    Submit Another Review
                </Button>
            </Box>
        );
    }

    // Helper function to render dynamic sections and avoid repeating code
    const renderThemedPointSection = (title, field, setter, description) => (
        <Stack spacing={2} sx={{ mt: 4 }}>

           <Box>
                <Typography variant="h6">{title}</Typography>
                {description && (
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                        {description}
                    </Typography>
                )}
            </Box>

           {field.map((point, index) => (
               <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} key={index} alignItems="center">
                   <FormControl fullWidth>
                       <InputLabel>Theme</InputLabel>
                       <Select name="theme" value={point.theme} label="Theme"
                            onChange={(e) => handleThemedPointChange(index, e, field, setter)}>
                           {themes.map(theme => <MenuItem key={theme} value={theme}>{theme}</MenuItem>)}
                       </Select>
                   </FormControl>
                   <TextField
                       fullWidth
                       label="Description"
                       name="description"
                       value={point.description}
                       onChange={(e) => handleThemedPointChange(index, e, field, setter)}
                   />
                   <IconButton onClick={() => handleRemoveThemedPoint(index, setter, field)} color="error" disabled={field.length === 1}>
                       <RemoveCircleOutlineIcon />
                   </IconButton>
               </Stack>
           ))}
           <Button
               startIcon={<AddCircleOutlineIcon />}
               onClick={() => handleAddThemedPoint(setter, field)}
               variant="outlined"
               sx={{ alignSelf: 'flex-start' }}
           >
               Add Other {title}
           </Button>
       </Stack>
   );

   // Helper for rendering statement radio groups to avoid repetition
    const renderStatementRadioGroup = (label, value, setter) => (
        <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup value={value} onChange={(e) => setter(e.target.value)}>
                {['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'].map(option => (
                    <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
            </RadioGroup>
        </FormControl>
    );

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { my: 1 } }}>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">Submit a Module Review</Typography>
                {/* --- Partial Save --- */}
                <Button variant='outlined' size='large' onClick={handleSaveDraft} disabled={submitLoading || !foundModule}>
                Save Draft
                </Button>
            </Stack>

            {/* --- Section 1: Module Details --- */}
            <Paper variant="outlined" sx={{ p: 3, my: 2 }}>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>Before starting, please review the module's Student Module Attainment Report and any other relevant feedback.
                    You will be required to upload the attainment report as evidence.
                    A crucial requirement is that all responses and uploaded documents must be anonymized,
                    with no names or identifying details of staff or students.
                    You can save your progress at any time using the "Save Draft" button and return to complete the form later.
                </Typography>
                
                <Typography variant="h6" gutterBottom>1. Module Details</Typography>
                <TextField fullWidth label="Please Enter the Module Code" value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
                disabled={!!paramModuleCode} error={!!lookupError} helperText={lookupError}
                InputProps={{ endAdornment: lookupLoading ? <CircularProgress size={20} /> : null }}/>

                {/* --- View Previous Report Section --- */}
                <Box sx={{ my: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle1" gutterBottom>
                        View a Previous Report
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField label="Year" type="number" size="small" value={previousYear}
                            onChange={(e) => setPreviousYear(e.target.value)} sx={{ maxWidth: { sm: 120 }, width: '100%' }}/>
                        <Button variant="outlined" color="secondary" onClick={handleViewPreviousReport}
                            disabled={!moduleCode.trim()} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                            View Previous Report</Button>
                    </Stack>
                </Box>


                <Collapse in={!!foundModule}>
                    {/* --- Display module details --- */}
                    {foundModule && (
                         <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Typography><b>Title:</b> {foundModule.title}</Typography>
                            <Typography><b>Discipline:</b> {foundModule.area}</Typography>
                            <Typography><b>Level:</b> {foundModule.level}</Typography>
                            <Typography><b>Period:</b> {foundModule.period}</Typography>
                            <Typography><b>Location:</b> {foundModule.location}</Typography>
                            <Typography>
                                <b>Module Lead:</b> {foundModule.lead?.firstName} {foundModule.lead?.lastName}
                            </Typography>
                         </Box>
                    )}
                </Collapse>
            </Paper>

            <Collapse in={!!foundModule && !foundModule.existingReviewId}>
                {/* --- Section 2: Reflective Analysis --- */}
                <Paper variant="outlined" sx={{ p: 3, my: 2 }}>
                    <Typography variant="h6" gutterBottom>2. Reflective Analysis</Typography>
                    <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            Provide an update on the enhancement plans from last year's review.
                            Summarize the changes you implemented, the progress of those actions, and their overall impact.</Typography>
                        <TextField fullWidth required label="Enhancement Plan Updates" multiline rows={2} value={enhanceUpdate} onChange={(e) => setEnhanceUpdate(e.target.value)}/>
                    </Box>
                    <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            Based on the 5-year data report, comment on any trends in student attainment,
                            including grades, number of attempts, and performance across different demographic groups.
                        </Typography>
                        <TextField fullWidth label="Student Attainment" multiline rows={2} value={studentAttainment} onChange={(e) => setStudentAttainment(e.target.value)}/>
                    </Box>
                    <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>Summarize the key themes and trends from module feedback,
                            considering input from students, staff, and external examiners.</Typography>
                        <TextField fullWidth label="Module Feedback" multiline rows={2} value={moduleFeedback} onChange={(e) => setModuleFeedback(e.target.value)}/>
                    </Box>
                    
                    {renderThemedPointSection("Good Practices", goodPractice, setGoodPractice,
                        "Highlight any areas of good practice that enhanced student learning and engagement, noting the specific strategies that worked well.")}
                    {renderThemedPointSection("Risks", risks, setRisks, 
                        "Identify any potential risks to the module's delivery (e.g., resource limitations, student performance) and explain how you plan to mitigate them."
                    )}

                    {/* --- Student Statement Inputs --- */}
                    <Stack direction="column" sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                         <Typography variant="h6" gutterBottom>Reflections on Student Statements</Typography>
                         {renderStatementRadioGroup("Students were actively engaged in the module's activities and learning process. *", statementEngagement, setStatementEngagement)}
                         {renderStatementRadioGroup("The teaching room and equipment were suitable for the effective delivery of this module. *", statementLearning, setStatementLearning)}
                         {renderStatementRadioGroup("The timetable and scheduling of this module were convenient to both staff and students. *", statementTimetable, setStatementTimetable)}
                    </Stack>
                </Paper>
                
                {/* --- Section 3: Enhancement Plans --- */}
                <Paper variant="outlined" sx={{ p: 3, my: 2 }}>
                    {/* ... enhancement plans section ... */}
                    <Typography variant="h6">3. Enhancement Plans</Typography>
                        <FormControl component="fieldset">
                            <FormLabel>Any enhancement plans?</FormLabel>
                                <RadioGroup row value={hasEnhancePlans} onChange={(e) => {
                                        const hasPlans = e.target.value === 'true';
                                        setHasEnhancePlans(hasPlans);
                                        // If user clicks Yes and there are no plan rows, add one
                                        if (hasPlans && enhancePlans.length === 0) {
                                            setEnhancePlans([{ theme: '', description: '' }]);
                                        }
                                    }}>
                                        <FormControlLabel value={true} control={<Radio />} label="Yes" />
                                        <FormControlLabel value={false} control={<Radio />} label="No" />
                                </RadioGroup>
                            </FormControl>
                            <Collapse in={hasEnhancePlans}>
                                    {renderThemedPointSection("Enhancement Plans", enhancePlans, setEnhancePlans,
                                         "Based on your review, outline the specific actions you plan to take to enhance the module for its next delivery, and select the appropriate category for each action.")}
                            </Collapse>
                </Paper>

                {/* --- Upload Evidence --- */}
                <Paper variant="outlined" sx={{ p: 3, my: 2 }}>
                    <Typography variant="h6">4. Upload Evidence</Typography>
                    <Typography variant="body1" color="textSecondary" sx={{mb: 2}}>
                        Upload the evidence you have reviewed and evaluated as part of your annual module review (Word/Excel/PPT/PDF/Image). *
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ my: 2 }} alignItems="center">
                        <Button variant="outlined" startIcon={<CloudUploadIcon />}
                        color="secondary" component="label" sx={{ width: { xs: '100%', sm: 'auto' }, minWidth:"230px" }}>
                            Upload Evidence Report
                            <input type="file" hidden onChange={(e) => setEvidenceUpload(e.target.files[0])} />
                        </Button>
                        {evidenceUpload && <Typography variant="body1" noWrap>{evidenceUpload.name}</Typography>}
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ my: 2 }} alignItems="center">
                        <Button variant="outlined" color="secondary" component="label" startIcon={<CloudUploadIcon />}
                        sx={{ width: { xs: '100%', sm: 'auto' }, minWidth:"230px" }}>
                            Upload Student Feedback
                            <input type="file" hidden onChange={(e) => setFeedbackUpload(e.target.files[0])} />
                        </Button>
                        {feedbackUpload && <Typography variant="body1" noWrap>{feedbackUpload.name}</Typography>}
                    </Stack>

                </Paper>
                
                {/* --- Section 4: Submission --- */}
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6">5. Submission</Typography>
                    <TextField fullWidth required label="Completed By (Full Name)" value={completedBy} onChange={(e) => setCompletedBy(e.target.value)} />
                    <Typography variant="body1" color="textSecondary" sx={{my: 2}}>
                        Click "Submit" to finalize your annual report.
                        Please note that your submission will be accessible to all staff across the University and will be used to inform official quality assurance processes.
                    </Typography>
                    {/* --- Container for button --- */}
                    <Stack direction='row' spacing={2} sx={{mt: 2}}>
                        <Button type="submit" variant="contained" size="large" disabled={submitLoading || !foundModule}>
                        {submitLoading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </Stack>

                    {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
                    {saveSuccess && <Alert severity="info" sx={{ mt: 2 }}>{saveSuccess}</Alert>}

                </Paper>
            </Collapse>


       </Box>
    );
}

export default CreateReview;