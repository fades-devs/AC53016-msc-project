
import {useState, useEffect} from 'react';

import { Link, useParams, useNavigate } from 'react-router-dom';

import axios from 'axios';
// MUI Components
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    Stack,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Alert,
    Collapse, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// --- UPDATE: Import the themes from your constants file ---
import { themes } from '../constants/filterOptions';


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

    // UPDATE - Get module code from URL if present
    const { moduleCode: paramModuleCode } = useParams();
    
    // FOR NAVIGATION TO SUBMIT ROUTE AFTER SUBMISSION
    const navigate = useNavigate();

    // State for the module lookup
    const [moduleCode, setModuleCode] = useState(paramModuleCode || ''); // Pre-fill if it's in the URL
    const [foundModule, setFoundModule] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    // state for date filter
    // const [dateFilter, setDateFilter] = useState('');

    // State for the review form fields
    const [enhanceUpdate, setEnhanceUpdate] = useState('')
    const [studentAttainment, setStudentAttainment] = useState('')
    const [moduleFeedback, setModuleFeedback] = useState('')
    const [goodPractice, setGoodPractice] = useState([{theme: '', description: ''}])
    const [risks, setRisks] = useState([{theme: '', description: ''}])
    const [hasEnhancePlans, setHasEnhancePlans] = useState(false);
    const [enhancePlans, setEnhancePlans] = useState([{theme: '', description: ''}])

    // --- UPDATE: State for added DB fields ---
    const [statementEngagement, setStatementEngagement] = useState('');
    const [statementLearning, setStatementLearning] = useState('');
    const [statementTimetable, setStatementTimetable] = useState('');
    const [completedBy, setCompletedBy] = useState('');

    // State for form submission
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // UPDATE: State for file uploads
    const [evidenceUpload, setEvidenceUpload] = useState(null);
    const [feedbackUpload, setFeedbackUpload] = useState(null);

    // Debounce the module code input to prevent API calls on every keystroke
    const debModuleCode = useDebounce(moduleCode, 500) // 500ms delay

    // const yearDeb = useDebounce(dateFilter, 500)

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
                // UPDATE: Use the new API endpoint structure
                const response = await axios.get(`http://localhost:5000/api/modules/${debModuleCode}`);

                setFoundModule(response.data);

                // UPDATE - If an existing review was found, set the error message
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

    // UPDATE: FUNCTION TO RESET THE FORM AFTER SUBMISSION
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
    
    // --- UPDATE: Submission handler now includes all new fields + FILE UPLOADS ---
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
            // SEND FORMDATA OBJECT

            // const reviewData = {
            //     moduleId: foundModule._id, enhanceUpdate, studentAttainment, moduleFeedback,
            //     goodPractice: goodPractice.filter(p => p.theme && p.description),
            //     risks: risks.filter(p => p.theme && p.description),
            //     // Only include enhancement plans if user chooses Yes
            //     enhancePlans: hasEnhancePlans ? enhancePlans.filter(p => p.theme && p.description): [],
            // statementEngagement, statementLearning, statementTimetable, completedBy};
            
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

    if (submitSuccess) {
        return (
            <Paper>
                <Stack alignItems="center">
                    <Alert severity="success" sx={{ width: '100%' }}>
                        Your review has been submitted successfully.
                    </Alert>
                    <Button variant="contained" onClick={resetForm}>
                        Submit New Review
                    </Button>
                </Stack>
            </Paper>
        )
    }

    // Helper function to render dynamic sections and avoid repeating code
    const renderThemedPointSection = (title, field, setter) => (
        <Stack spacing={2}>
           <Typography variant="h6">{title}</Typography>
           {field.map((point, index) => (
               <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} key={index} alignItems="center">
                   <FormControl fullWidth>
                       <InputLabel>Theme</InputLabel>
                       <Select
                           name="theme"
                           value={point.theme}
                           label="Theme"
                           onChange={(e) => handleThemedPointChange(index, e, field, setter)}
                       >
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
               Add {title}
           </Button>
       </Stack>
   );

   // Helper for rendering statement radio groups to avoid repetition
    const renderStatementRadioGroup = (label, value, setter) => (
        <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup row value={value} onChange={(e) => setter(e.target.value)}>
                {['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'].map(option => (
                    <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
            </RadioGroup>
        </FormControl>
    );

//    const handledateFilterChange = (e) => {
//         setDateFilter(e.target.value);
//     };

    // --- UPDATE: Find the specific variant to display its details ---
    const specificVariant = foundModule?.variants.find(
        (variant) => variant.code === debModuleCode
    );

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { my: 1 } }}>
            <Typography variant="h5" gutterBottom>Submit a Module Review</Typography>

            {/* --- Section 1: Module Details --- */}
            <Paper elevation={2} sx={{ p: 3, my: 2 }}>
                <Typography variant="h6">1. Module Details</Typography>
                <TextField fullWidth label="Module Code" value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
                disabled={!!paramModuleCode} error={!!lookupError} helperText={lookupError}/>


                <Collapse in={!!foundModule && !!specificVariant}>
                    {/* --- Add the correct JSX to display module details here --- */}
                    {specificVariant && (
                         <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Typography><b>Title:</b> {foundModule.title}</Typography>
                            <Typography><b>Area:</b> {foundModule.area}</Typography>
                            <Typography><b>Level:</b> {specificVariant.level}</Typography>
                            <Typography><b>Period:</b> {specificVariant.period}</Typography>
                            <Typography><b>Location:</b> {foundModule.location}</Typography>
                            <Typography><b>Partnership:</b> {foundModule.partnership}</Typography>
                            <Typography>
                                <b>Module Lead:</b> {specificVariant.lead?.firstName} {specificVariant.lead?.lastName}
                            </Typography>
                         </Box>
                    )}
                </Collapse>
            </Paper>

            <Collapse in={!!foundModule && !!specificVariant && !foundModule.existingReviewId}>
                {/* --- Section 2: Reflective Analysis --- */}
                <Paper elevation={2} sx={{ p: 3, my: 2 }}>
                    <Typography variant="h6">2. Reflective Analysis</Typography>
                    <TextField fullWidth required label="Enhancement Plan Updates" multiline rows={2} value={enhanceUpdate} onChange={(e) => setEnhanceUpdate(e.target.value)}/>
                    <TextField fullWidth label="Student Attainment" multiline rows={2} value={studentAttainment} onChange={(e) => setStudentAttainment(e.target.value)}/>
                    <TextField fullWidth label="Module Feedback" multiline rows={2} value={moduleFeedback} onChange={(e) => setModuleFeedback(e.target.value)}/>
                    
                    {renderThemedPointSection("Good Practice", goodPractice, setGoodPractice)}
                    {renderThemedPointSection("Risks", risks, setRisks)}

                    {/* --- Student Statement Inputs --- */}
                    <Stack direction="column" sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                         <Typography variant="subtitle1" gutterBottom>Student Statements</Typography>
                         {renderStatementRadioGroup("Students were actively engaged in the module's activities and learning process.", statementEngagement, setStatementEngagement)}
                         {renderStatementRadioGroup("The teaching room and equipment were suitable for the effective delivery of this module.", statementLearning, setStatementLearning)}
                         {renderStatementRadioGroup("The timetable and scheduling of this module were convenient to both staff and students.", statementTimetable, setStatementTimetable)}
                    </Stack>
                </Paper>
                
                {/* --- Section 3: Enhancement Plans --- */}
                <Paper elevation={2} sx={{ p: 3, my: 2 }}>
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
                                    {renderThemedPointSection("Enhancement Plans", enhancePlans, setEnhancePlans)}
                            </Collapse>
                </Paper>

                {/* --- NEW Section: Upload Evidence --- */}
                <Paper elevation={2} sx={{ p: 3, my: 2 }}>
                    <Typography variant="h6">4. Upload Evidence</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{mb: 2}}>
                        Upload the evidence report and student feedback.
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ my: 2 }} alignItems="center">
                        <Button variant="outlined" component="label">
                            Upload Evidence Report
                            <input type="file" hidden onChange={(e) => setEvidenceUpload(e.target.files[0])} />
                        </Button>
                        {evidenceUpload && <Typography variant="body1">{evidenceUpload.name}</Typography>}
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ my: 2 }} alignItems="center">
                        <Button variant="outlined" component="label">
                            Upload Student Feedback
                            <input type="file" hidden onChange={(e) => setFeedbackUpload(e.target.files[0])} />
                        </Button>
                        {feedbackUpload && <Typography variant="body1">{feedbackUpload.name}</Typography>}
                    </Stack>

                </Paper>
                
                {/* --- Section 4: Submission --- */}
                <Paper elevation={2} sx={{ p: 3, my: 2 }}>
                    <Typography variant="h6">5. Submission</Typography>
                    <TextField fullWidth required label="Completed By (Full Name)" value={completedBy} onChange={(e) => setCompletedBy(e.target.value)} />
                    <Button sx={{mt: 2}} type="submit" variant="contained" size="large" disabled={submitLoading || !foundModule}>
                        {submitLoading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
                </Paper>
            </Collapse>


       </Box>
    );
}


export default CreateReview;