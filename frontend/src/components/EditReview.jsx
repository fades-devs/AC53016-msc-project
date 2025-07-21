
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
    const [specificVariant, setSpecificVariant] = useState(null);
    
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

                // Find the specific variant from the populated module data
                const variant = data.module.variants.find(v => v.code === data.module.variants[0].code); // Simplified assumption
                // const variant = data.module.variants[0]; - this logic assumes 1st variant is primary one
                setSpecificVariant(variant);

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
        return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
    }

    if (pageError) {
        return <Alert severity="error">{pageError}</Alert>;
    }
    
    // Helper function to render dynamic sections
    const renderThemedPointSection = (title, field, setter) => (
        <Stack spacing={2}>
           <Typography variant="h6">{title}</Typography>
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
               Add {title}
           </Button>
       </Stack>
    );

    // Helper for rendering statement radio groups
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


    return (
        
        <Box>
            <Typography variant="h5" gutterBottom>Edit Module Review</Typography>

            {/* Section 1: Module Details (Read-only) */}
            <Paper elevation={2} sx={{ p: 3, my: 2 }}>
                <Typography variant="h6">1. Module Details</Typography>
                {specificVariant && moduleDetails && (
                    <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'action.hover' }}>
                        <Typography><b>Code:</b> {specificVariant.code}</Typography>
                        <Typography><b>Title:</b> {moduleDetails.title}</Typography>
                        <Typography><b>Area:</b> {moduleDetails.area}</Typography>
                        <Typography><b>Level:</b> {specificVariant.level}</Typography>
                        <Typography><b>Period:</b> {specificVariant.period}</Typography>
                        <Typography><b>Location:</b> {moduleDetails.location}</Typography>
                        <Typography><b>Partnership:</b> {moduleDetails.partnership}</Typography>
                        <Typography><b>Module Lead:</b> {specificVariant.lead?.firstName} {specificVariant.lead?.lastName}</Typography>
                    </Box>
                )}
            </Paper>

            {/* The rest of the form */}
            <Box component="form" onSubmit={(e) => e.preventDefault()}>
                {/* Section 2: Reflective Analysis */}
                <Paper elevation={2} sx={{ p: 3, my: 2 }}>
                    <Typography variant="h6">2. Reflective Analysis</Typography>
                    <TextField fullWidth required label="Enhancement Plan Updates" multiline rows={2} value={enhanceUpdate} onChange={(e) => setEnhanceUpdate(e.target.value)} sx={{my:1}}/>
                    <TextField fullWidth label="Student Attainment" multiline rows={2} value={studentAttainment} onChange={(e) => setStudentAttainment(e.target.value)} sx={{my:1}}/>
                    <TextField fullWidth label="Module Feedback" multiline rows={2} value={moduleFeedback} onChange={(e) => setModuleFeedback(e.target.value)} sx={{my:1}}/>
                    
                    {renderThemedPointSection("Good Practice", goodPractice, setGoodPractice)}
                    {renderThemedPointSection("Risks", risks, setRisks)}

                    <Stack direction="column" sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Student Statements</Typography>
                        {renderStatementRadioGroup("Students were actively engaged...", statementEngagement, setStatementEngagement)}
                        {renderStatementRadioGroup("The teaching room and equipment were suitable...", statementLearning, setStatementLearning)}
                        {renderStatementRadioGroup("The timetable and scheduling were convenient...", statementTimetable, setStatementTimetable)}
                    </Stack>
                </Paper>
                
                {/* Section 3: Enhancement Plans */}
                <Paper elevation={2} sx={{ p: 3, my: 2 }}>
                    <Typography variant="h6">3. Enhancement Plans</Typography>
                    <FormControl component="fieldset">
                        <FormLabel>Any enhancement plans?</FormLabel>
                        <RadioGroup row value={hasEnhancePlans} onChange={(e) => setHasEnhancePlans(e.target.value === 'true')}>
                            <FormControlLabel value={true} control={<Radio />} label="Yes" />
                            <FormControlLabel value={false} control={<Radio />} label="No" />
                        </RadioGroup>
                    </FormControl>
                    <Collapse in={hasEnhancePlans}>
                        {renderThemedPointSection("Enhancement Plans", enhancePlans, setEnhancePlans)}
                    </Collapse>
                </Paper>

                {/* Section 4: Upload Evidence */}
                <Paper elevation={2} sx={{ p: 3, my: 2 }}>
                    <Typography variant="h6">4. Upload Evidence</Typography>
                    <Stack direction="row" spacing={2} sx={{ my: 2 }} alignItems="center">
                        <Button variant="outlined" component="label">Upload New Evidence Report<input type="file" hidden onChange={(e) => setEvidenceUpload(e.target.files[0])} /></Button>
                        {evidenceUpload ? <Typography variant="body1">{evidenceUpload.name}</Typography> : existingEvidenceFile && (
                             <MuiLink href={`http://localhost:5000/${existingEvidenceFile.path}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon fontSize="small"/> {existingEvidenceFile.name}
                            </MuiLink>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ my: 2 }} alignItems="center">
                        <Button variant="outlined" component="label">Upload New Student Feedback<input type="file" hidden onChange={(e) => setFeedbackUpload(e.target.files[0])} /></Button>
                         {feedbackUpload ? <Typography variant="body1">{feedbackUpload.name}</Typography> : existingFeedbackFile && (
                             <MuiLink href={`http://localhost:5000/${existingFeedbackFile.path}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon fontSize="small"/> {existingFeedbackFile.name}
                            </MuiLink>
                        )}
                    </Stack>
                </Paper>
                
                {/* Section 5: Submission */}
                <Paper elevation={2} sx={{ p: 3, my: 2 }}>
                    <Typography variant="h6">5. Submission</Typography>
                    <TextField fullWidth required label="Completed By (Full Name)" value={completedBy} onChange={(e) => setCompletedBy(e.target.value)} sx={{my:1}}/>
                    <Stack direction='row' spacing={2} sx={{mt: 2}}>
                        <Button variant="contained" size="large" onClick={() => handleUpdate('Completed')} disabled={submitLoading}>
                            {submitLoading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                        <Button variant='outlined' size='large' onClick={() => handleUpdate('In Progress')} disabled={submitLoading}>
                            {submitLoading ? 'Saving...' : 'Save Changes'}
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