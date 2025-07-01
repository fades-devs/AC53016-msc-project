
import {useState, useEffect} from 'react';
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

const themes = ['Assessment', 'Learning and Teaching', 'Course Design and Development', 'Student Engagement'];

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

    // State for the module lookup
    const [moduleCode, setModuleCode] = useState('');
    const [foundModule, setFoundModule] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');
    // State for the review form fields
    const [enhanceUpdate, setEnhanceUpdate] = useState('')
    const [studentAttainment, setStudentAttainment] = useState('')
    const [moduleFeedback, setModuleFeedback] = useState('')
    const [goodPractice, setGoodPractice] = useState([{theme: '', description: ''}])
    const [risks, setRisks] = useState([{theme: '', description: ''}])
    const [hasEnhancePlans, setHasEnhancePlans] = useState(false);
    const [enhancePlans, setEnhancePlans] = useState([{theme: '', description: ''}])
    // State for form submission
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

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
                const response = await axios.get(`http://localhost:5000/api/modules/lookup?code=${debModuleCode}`);
                setFoundModule(response.data);
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
    // Handler for form submission
    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!foundModule) {
            setSubmitError('You must find and select a valid module before submitting.');
            return;
        }
        setSubmitLoading(true);
        setSubmitError('');
        setSubmitSuccess(false);

        try {
            const reviewData = {
                moduleId: foundModule._id, enhanceUpdate, studentAttainment, moduleFeedback,
                goodPractice: goodPractice.filter(p => p.theme && p.description),
                risks: risks.filter(p => p.theme && p.description),
                // Only include enhancement plans if user chooses Yes
                enhancePlans: hasEnhancePlans ? enhancePlans.filter(p => p.theme && p.description): []};
            
            await axios.post('http://localhost:5000/api/reviews', reviewData);
            setSubmitSuccess(true);
            // Optionally reset the form

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
                    <Button variant="contained" onClick={() => setSubmitSuccess(false)}>
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

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography>1. Module Details</Typography>
            <TextField label="Module Code" value={moduleCode} onChange={(e) => setModuleCode(e.target.value.toUpperCase())}/>
            <Collapse in={!!foundModule}>
                <Typography variant="h6" gutterBottom>Module Details</Typography>
                <Typography>Title: {foundModule?.title}</Typography>
                <Typography>Area: {foundModule?.area}</Typography>
                <Typography>Level: {foundModule?.level}</Typography>
                <Typography>Module Lead: {foundModule?.lead.firstName} {foundModule?.lead.lastName}</Typography>
            </Collapse>

            {/* Review Details Section */}
            <Collapse in={!!foundModule}>
                <Stack>
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6">2. Reflective Analysis</Typography>
                        <TextField fullWidth label="Enhancement Plan Updates" multiline rows={2} value={enhanceUpdate} onChange={(e) => setEnhanceUpdate(e.target.value)}/>
                        <TextField fullWidth label="Student Attainment" multiline rows={2} value={studentAttainment} onChange={(e) => setStudentAttainment(e.target.value)}/>
                        <TextField fullWidth label="Module Feedback" multiline rows={2} value={moduleFeedback} onChange={(e) => setModuleFeedback(e.target.value)}/>

                        {renderThemedPointSection("Good Practice", goodPractice, setGoodPractice)}
                        {renderThemedPointSection("Risks", risks, setRisks)}
                    </Box>
                    <Box sx={{ mt: 4 }}>
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
                    </Box>

                    <Button type="submit" variant="contained" size="large" disabled={submitLoading || !foundModule}>
                        {submitLoading ? 'Submitting...' : 'Submit Review'}
                    </Button>

                </Stack>
            </Collapse>
       </Box>
    );
}


export default CreateReview;