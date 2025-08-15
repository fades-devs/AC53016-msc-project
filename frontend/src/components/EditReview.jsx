
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
    Alert, CircularProgress, 
    Collapse, InputLabel, Select, MenuItem, IconButton, Link as MuiLink
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import {CloudUpload as CloudUploadIcon} from '@mui/icons-material';

// Import the themes from constants file ---
import { themes } from '../constants/filterOptions';

const EditReview = () => {

    // --- HOOKS ---
    const { reviewId } = useParams(); // Get the reviewId from the URL
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---

    // State for loading the initial review data
    const [pageLoading, setPageLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    // State for module details (will be populated from the fetched review)
    const [moduleDetails, setModuleDetails] = useState(null);
    
    // // State for the module lookup
    // const [moduleCode, setModuleCode] = useState(paramModuleCode || ''); // Pre-fill if it's in the URL
    // const [foundModule, setFoundModule] = useState(null);
    // const [lookupLoading, setLookupLoading] = useState(false);
    // const [lookupError, setLookupError] = useState('');
    // state for date filter
    // const [dateFilter, setDateFilter] = useState('');

    // State for the review form fields
    const [status, setStatus] = useState('');
    const [enhanceUpdate, setEnhanceUpdate] = useState('');
    const [studentAttainment, setStudentAttainment] = useState('');
    const [moduleFeedback, setModuleFeedback] = useState('');
    const [goodPractice, setGoodPractice] = useState([{ theme: '', description: '' }]);
    const [risks, setRisks] = useState([{ theme: '', description: '' }]);
    const [hasEnhancePlans, setHasEnhancePlans] = useState(false);
    const [enhancePlans, setEnhancePlans] = useState([{ theme: '', description: '' }]);
    const [statementEngagement, setStatementEngagement] = useState('');
    const [statementLearning, setStatementLearning] = useState('');
    const [statementTimetable, setStatementTimetable] = useState('');
    const [completedBy, setCompletedBy] = useState('');

    // State for file uploads
    const [evidenceUpload, setEvidenceUpload] = useState(null);
    const [feedbackUpload, setFeedbackUpload] = useState(null);
    const [existingEvidenceFile, setExistingEvidenceFile] = useState(null);
    const [existingFeedbackFile, setExistingFeedbackFile] = useState(null);

    // State for form submission (updating)
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');


    // --- DATA FETCHING ---
    // Effect to fetch the existing review data when the component mounts
    useEffect(() => {

        // --- FIX: Add a guard clause to prevent fetching if reviewId is missing ---
        if (!reviewId) {
            setPageLoading(false);
            setPageError('No review ID was provided in the URL. Please go back and select a review to edit.');
            return; // Stop the effect from running further
        }

        const fetchReviewData = async () => {

            // --- FIX: Clear previous errors and set loading state for the new fetch attempt ---
            setPageError('');
            setPageLoading(true);

            try {
                // Use the getReviewById endpoint
                const response = await axios.get(`http://localhost:5000/api/reviews/${reviewId}`);
                const data = response.data;

                // UPDATE: Compare review year to current to allow edit for only current year reviews
                const reviewYear = new Date(data.createdAt).getFullYear();
                if (reviewYear < new Date().getFullYear()) {
                    setPageError(`Reviews from previous years cannot be updated. Please select the ${new Date().getFullYear()} review`);
                }
                
                // --- Populate all form fields with the fetched data ---
                setModuleDetails(data.module);

                setStatus(data.status || 'In Progress');
                setEnhanceUpdate(data.enhanceUpdate || '');
                setStudentAttainment(data.studentAttainment || '');
                setModuleFeedback(data.moduleFeedback || '');
                setCompletedBy(data.completedBy || '');

                // Ensure arrays are not empty to avoid errors
                setGoodPractice(data.goodPractice.length > 0 ? data.goodPractice : [{ theme: '', description: '' }]);
                setRisks(data.risks.length > 0 ? data.risks : [{ theme: '', description: '' }]);

                // Handle enhancement plans
                if (data.enhancePlans && data.enhancePlans.length > 0) {
                    setHasEnhancePlans(true);
                    setEnhancePlans(data.enhancePlans);
                } else {
                    setHasEnhancePlans(false);
                    setEnhancePlans([{ theme: '', description: '' }]);
                }

                setStatementEngagement(data.statementEngagement || '');
                setStatementLearning(data.statementLearning || '');
                setStatementTimetable(data.statementTimetable || '');

                // Set existing file info for display
                if (data.evidenceUpload) setExistingEvidenceFile({ name: data.evidenceUpload_originalName, path: data.evidenceUpload });
                if (data.feedbackUpload) setExistingFeedbackFile({ name: data.feedbackUpload_originalName, path: data.feedbackUpload });

            }
            catch (err) {
                setPageError('Failed to load review data. Please check the ID.');
                console.error(err);
            }
            finally {
                setPageLoading(false);
            }

        };

        fetchReviewData();

    }, [reviewId]) // This effect runs only when the reviewId changes

    // --- FORM HANDLERS ---
    const handleThemedPointChange = (index, event, field, setter) => {
        const { name, value } = event.target;
        const list = [...field];
        list[index][name] = value;
        setter(list);
    };
    const handleAddThemedPoint = (setter, field) => {
        setter([...field, { theme: '', description: '' }]);
    };
    const handleRemoveThemedPoint = (index, setter, field) => {
        if (field.length <= 1) return;
        const list = [...field];
        list.splice(index, 1);
        setter(list);
    };

    // --- SUBMISSION HANDLER (Update Logic) ---
    const handleUpdate = async (newStatus) => {

        setSubmitLoading(true);
        setSubmitError('');
        setSubmitSuccess('');

        const formData = new FormData();
        
        // Append all form data
        formData.append('status', newStatus); // 'In Progress' or 'Completed'
        formData.append('enhanceUpdate', enhanceUpdate);
        formData.append('studentAttainment', studentAttainment);
        formData.append('moduleFeedback', moduleFeedback);
        formData.append('completedBy', completedBy);
        formData.append('statementEngagement', statementEngagement);
        formData.append('statementLearning', statementLearning);
        formData.append('statementTimetable', statementTimetable);
        formData.append('goodPractice', JSON.stringify(goodPractice.filter(p => p.theme && p.description)));
        formData.append('risks', JSON.stringify(risks.filter(p => p.theme && p.description)));
        formData.append('enhancePlans', JSON.stringify(hasEnhancePlans ? enhancePlans.filter(p => p.theme && p.description) : []));

        // Append new files ONLY if they have been selected
        if (evidenceUpload) formData.append('evidenceUpload', evidenceUpload);
        if (feedbackUpload) formData.append('feedbackUpload', feedbackUpload);

        try {
            // Use the PUT method to update the review
            await axios.put(`http://localhost:5000/api/reviews/${reviewId}`, formData);
            
            setSubmitSuccess(`Review successfully ${newStatus === 'Completed' ? 'submitted' : 'saved'}!`);
            
            // Redirect after a short delay
            setTimeout(() => {
                navigate('/module-list');
            }, 2000);

        } catch (err) {
            setSubmitError('Failed to update the review. Please try again.');
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    };

    // --- RENDER LOGIC ---

if (pageLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (pageError) {
        return <Alert severity="error">{pageError}</Alert>;
    }
    
    // Helper function to render dynamic sections
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
                       <Select name="theme" value={point.theme} label="Theme" onChange={(e) => handleThemedPointChange(index, e, field, setter)}>
                           {themes.map(theme => <MenuItem key={theme} value={theme}>{theme}</MenuItem>)}
                       </Select>
                   </FormControl>
                   <TextField fullWidth label="Description" name="description" value={point.description} onChange={(e) => handleThemedPointChange(index, e, field, setter)} />
                   <IconButton onClick={() => handleRemoveThemedPoint(index, setter, field)} color="error" disabled={field.length === 1}>
                       <RemoveCircleOutlineIcon />
                   </IconButton>
               </Stack>
           ))}
           <Button startIcon={<AddCircleOutlineIcon />} onClick={() => handleAddThemedPoint(setter, field)} variant="outlined" sx={{ alignSelf: 'flex-start' }}>
               Add Other {title}
           </Button>
       </Stack>
    );

    // Helper for rendering statement radio groups
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
        
        <Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1">Edit Module Review</Typography>
                    <Button variant='outlined' size='large' onClick={() => handleUpdate('In Progress')} disabled={submitLoading}>
                        {submitLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Stack>

            {/* Section 1: Module Details (Read-only) */}
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                <Typography variant="h6">1. Module Details</Typography>
                {moduleDetails && (
                    <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                        <Typography><b>Code:</b> {moduleDetails.code}</Typography>
                        <Typography><b>Title:</b> {moduleDetails.title}</Typography>
                        <Typography><b>Discipline:</b> {moduleDetails.area}</Typography>
                        <Typography><b>Level:</b> {moduleDetails.level}</Typography>
                        <Typography><b>Period:</b> {moduleDetails.period}</Typography>
                        <Typography><b>Location:</b> {moduleDetails.location}</Typography>
                        <Typography><b>Module Lead:</b> {moduleDetails.lead?.firstName} {moduleDetails.lead?.lastName}</Typography>
                    </Box>
                )}
            </Paper>

            {/* The rest of the form */}
            <Box component="form" onSubmit={(e) => e.preventDefault()}>
                {/* Section 2: Reflective Analysis */}
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>2. Reflective Analysis</Typography>
                    <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                                    Provide an update on the enhancement plans from last year's review.
                                                    Summarize the changes you implemented, the progress of those actions, and their overall impact.</Typography>
                        <TextField fullWidth required label="Enhancement Plan Updates" multiline rows={2} value={enhanceUpdate} onChange={(e) => setEnhanceUpdate(e.target.value)} sx={{my:1}}/>
                    </Box>
                    <Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                                    Based on the 5-year data report, comment on any trends in student attainment,
                                                    including grades, number of attempts, and performance across different demographic groups.</Typography>
                        <TextField fullWidth label="Student Attainment" multiline rows={2} value={studentAttainment} onChange={(e) => setStudentAttainment(e.target.value)} sx={{my:1}}/>
                    </Box>
                    <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>Summarize the key themes and trends from module feedback,
                                                    considering input from students, staff, and external examiners.</Typography>
                        <TextField fullWidth label="Module Feedback" multiline rows={2} value={moduleFeedback} onChange={(e) => setModuleFeedback(e.target.value)} sx={{my:1}}/>
                    </Box>
                    
                    {renderThemedPointSection("Good Practice", goodPractice, setGoodPractice,
                        "Highlight any areas of good practice that enhanced student learning and engagement, noting the specific strategies that worked well."
                    )}
                    {renderThemedPointSection("Risks", risks, setRisks,
                        "Identify any potential risks to the module's delivery (e.g., resource limitations, student performance) and explain how you plan to mitigate them."
                    )}

                    <Stack direction="column" sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                        <Typography variant="h6" gutterBottom>Reflections on Student Statements</Typography>
                        {renderStatementRadioGroup("Students were actively engaged in the module's activities and learning process. *", statementEngagement, setStatementEngagement)}
                        {renderStatementRadioGroup("The teaching room and equipment were suitable for the effective delivery of this module. *", statementLearning, setStatementLearning)}
                        {renderStatementRadioGroup("The timetable and scheduling of this module were convenient to both staff and students. *", statementTimetable, setStatementTimetable)}
                    </Stack>
                </Paper>
                
                {/* Section 3: Enhancement Plans */}
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6">3. Enhancement Plans</Typography>
                    <FormControl component="fieldset">
                        <FormLabel>Any enhancement plans?</FormLabel>
                        <RadioGroup row value={hasEnhancePlans} onChange={(e) => setHasEnhancePlans(e.target.value === 'true')}>
                            <FormControlLabel value={true} control={<Radio />} label="Yes" />
                            <FormControlLabel value={false} control={<Radio />} label="No" />
                        </RadioGroup>
                    </FormControl>
                    <Collapse in={hasEnhancePlans}>
                        {renderThemedPointSection("Enhancement Plans", enhancePlans, setEnhancePlans,
                            "Based on your review, outline the specific actions you plan to take to enhance the module for its next delivery, and select the appropriate category for each action."
                        )}
                    </Collapse>
                </Paper>

                {/* Section 4: Upload Evidence */}
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6">4. Upload Evidence</Typography>
                    <Typography variant="body1" color="textSecondary" sx={{mb: 2}}>
                                            Upload the evidence you have reviewed and evaluated as part of your annual module review (Word/Excel/PPT/PDF/Image). *
                                        </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ my: 2 }} alignItems="center">
                        <Button  startIcon={<CloudUploadIcon />} variant="outlined" color="secondary" component="label" sx={{ width: { xs: '100%', sm: 'auto' }, minWidth:"260px" }}>
                            Upload New Evidence Report<input type="file" hidden onChange={(e) => setEvidenceUpload(e.target.files[0])} />
                            </Button>
                        {evidenceUpload ? <Typography variant="body1">{evidenceUpload.name}</Typography> : existingEvidenceFile && (
                             <MuiLink href={`http://localhost:5000/${existingEvidenceFile.path}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon fontSize="small"/> {existingEvidenceFile.name}
                            </MuiLink>
                        )}
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ my: 2 }} alignItems="center">
                        <Button startIcon={<CloudUploadIcon />} variant="outlined" color="secondary" component="label" sx={{ width: { xs: '100%', sm: 'auto' }, minWidth:"260px" }}>
                            Upload New Student Feedback<input type="file" hidden onChange={(e) => setFeedbackUpload(e.target.files[0])} /></Button>
                         {feedbackUpload ? <Typography variant="body1">{feedbackUpload.name}</Typography> : existingFeedbackFile && (
                             <MuiLink href={`http://localhost:5000/${existingFeedbackFile.path}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon fontSize="small"/> {existingFeedbackFile.name}
                            </MuiLink>
                        )}
                    </Stack>
                </Paper>
                
                {/* Section 5: Submission */}
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                    <Typography variant="h6">5. Submission</Typography>
                    <TextField fullWidth required label="Completed By (Full Name)" value={completedBy} onChange={(e) => setCompletedBy(e.target.value)} sx={{my:1}}/>
                    <Typography variant="body1" color="textSecondary" sx={{my: 2}}>
                                            Click "Submit" to finalize your annual report.
                                            Please note that your submission will be accessible to all staff across the University and will be used to inform official quality assurance processes.
                    </Typography>
                    
                    <Stack direction='row' spacing={2} sx={{mt: 2}}>
                        <Button variant="contained" size="large" onClick={() => handleUpdate('Completed')} disabled={submitLoading}>
                            {submitLoading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </Stack>
                    {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
                    {submitSuccess && <Alert severity="success" sx={{ mt: 2 }}>{submitSuccess}</Alert>}
                </Paper>
            </Box>
        </Box>

    );
}


export default EditReview;