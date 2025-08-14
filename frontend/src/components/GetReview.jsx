import {useState, useEffect} from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";

import {
    Box, Button,
    CircularProgress,
    TextField,
    Typography,
    Paper,
    Grid,
    Stack,
    Alert,
    Collapse,
    Divider,
    Link as MuiLink
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';

// Helper component to display a key-value pair for module details
const DetailItem = ({ label, value }) => (
    <Box>
        <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>{label}</Typography>
        <Typography>{value || 'N/A'}</Typography>
    </Box>
);


// Reusable component to display themed points
const ThemedPointDisplay = ({ title, points }) => {
    if (!points || points.length === 0) {
        return <DetailItem label={title} value="No items were recorded." />;
    }

    return (
        <Stack spacing={1}>
            <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
            {points.map((point, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold' }}>
                        {point.theme}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                        {point.description}
                    </Typography>
                </Paper>
            ))}
        </Stack>
    );
};

const GetReview = () => {

    // UPDATE: Hooks for navigation and URL parameters
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Custom hook for debouncing input
    const useDebounce = (value, delay) => {
        const [debValue, setDebValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debValue;
    };

    // STATE - for module lookup review data
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State for the user input fields for searching
    const [moduleCodeInput, setModuleCodeInput] = useState(searchParams.get('code') || '');
    const [yearInput, setYearInput] = useState(searchParams.get('year') || new Date().getFullYear());

    // Debounce the module code input
    const debModuleCode = useDebounce(moduleCodeInput, 500);
    const debYear = useDebounce(yearInput, 500);

    // EFFECT 1: Effect's job is to keep the URL in sync with the user's typing
    useEffect(() => {
        // Only update the URL if the user has typed a module code.
        if (debModuleCode) {
            navigate(`/get-review?code=${debModuleCode}&year=${debYear}`, { replace: true });
        }
    }, [debModuleCode, debYear, navigate]);
    // --- EFFECT 2: Fetch data when the URL (searchParams) changes ---
    // runs whenever the link is clicked OR the URL is changed by Effect 1.
    useEffect(() => {
        const code = searchParams.get('code');
        const year = searchParams.get('year');

        // Do not fetch if there is no module code in the URL
        if (!code) {
            setReviewData(null);
            setError('')
            return;
        }

        const fetchReview = async () => {
            
            setLoading(true);
            setError('');
            setReviewData(null);

            try {
                // UPDATE - Lookup API endpoint
                const response = await axios.get(`http://localhost:5000/api/reviews/lookup/by-module`, {params: { code, year }});
                setReviewData(response.data);
            }
            catch(err) {
                setReviewData(null);
                if (err.response && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('An error occurred while searching for the review.');
                }
            }
            finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [searchParams]); // This effect ONLY depends on the URL's search parameters.


    // // UPDATE - Handler for the search form submission
    // const handleSearch = (e) => {
    //     e.preventDefault();
    //     if (debModuleCode) {
    //         // Update the URL, which will trigger the useEffect hook to fetch the data
    //         navigate(`/get-review?code=${debModuleCode}&year=${debYear}`);
    //     }
    // };

    // // Find the specific module variant that matches the searched code
    // const specificVariant = reviewData?.module.variants.find(
    //     (variant) => variant.code.toLowerCase() === searchParams.get('code')?.toLowerCase()
    // );


    return (

        <Box>
            
            {/* --- UPDATE: Title and Edit Button --- */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1">
                    View Module Review
                </Typography>
                {/* This button will only appear when review data is loaded */}
                {reviewData && (
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        component={Link}
                        to={`/edit-review/${reviewData._id}`} // Link to the edit page with the review ID
                    >
                        Edit Report
                    </Button>
                )}
            </Stack>

            {/* --- Section 1: Search Form --- */}
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
                <Typography variant="h6" component="h2" gutterBottom>1. Find a Review</Typography>
                <Stack component="form" noValidate direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        label="Module Code"
                        value={moduleCodeInput}
                        onChange={(e) => setModuleCodeInput(e.target.value.toUpperCase())}
                        required autoFocus
                    />
                    <TextField
                        label="Year"
                        type="number"
                        value={yearInput}
                        onChange={(e) => setYearInput(e.target.value)}
                        required
                    />
                    {/* <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </Button> */}
                </Stack>
            </Paper>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
            <Collapse in={!!error}><Alert severity="error" sx={{ my: 2 }}>{error}</Alert></Collapse>

            {/* --- Display review data only if it exists --- */}
            <Collapse in={!!reviewData}>
                {reviewData && (

                    <Stack spacing={3}>
                        {/* --- Section 2: Module & Review Details --- */}
                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                            <Stack spacing={2}>
                                <Typography variant="h6" component="h2">2. Module Details</Typography>
                                <Divider />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}><DetailItem label="Title" value={reviewData.module.title} /></Grid>
                                    <Grid item xs={12} sm={6} md={4}><DetailItem label="Area" value={reviewData.module.area} /></Grid>
                                    <Grid item xs={12} sm={6} md={4}><DetailItem label="Level" value={reviewData.module.level} /></Grid>
                                    <Grid item xs={12} sm={6} md={4}><DetailItem label="Period" value={reviewData.module.period} /></Grid>
                                    <Grid item xs={12} sm={6} md={4}><DetailItem label="Location" value={reviewData.module.location} /></Grid>
                                    <Grid item xs={12} sm={6} md={4}><DetailItem label="Module Lead" value={`${reviewData.module.lead?.firstName} ${reviewData.module.lead?.lastName}`} /></Grid>
                                    <Grid item xs={12} sm={6} md={4}><DetailItem label="Review Status" value={reviewData.status} /></Grid>
                                    <Grid item xs={12} sm={6} md={4}><DetailItem label="Review Year" value={new Date(reviewData.createdAt).getFullYear()} /></Grid>
                                </Grid>
                            </Stack>
                        </Paper>

                        {/* --- Section 3: Reflective Analysis --- */}
                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                            <Stack spacing={2}>
                                <Typography variant="h6" component="h2">3. Reflective Analysis</Typography>
                                <Divider />
                                <DetailItem label="Enhancement Plan Updates" value={reviewData.enhanceUpdate} />
                                <DetailItem label="Student Attainment" value={reviewData.studentAttainment} />
                                <DetailItem label="Module Feedback" value={reviewData.moduleFeedback} />
                                <Divider />
                                <ThemedPointDisplay title="Good Practice" points={reviewData.goodPractice} />
                                <ThemedPointDisplay title="Identified Risks" points={reviewData.risks} />
                                <Divider />
                                <Typography variant="h6" component="h3">Student Statements</Typography>
                                <DetailItem label="Students were actively engaged" value={reviewData.statementEngagement} />
                                <DetailItem label="The teaching room and equipment were suitable" value={reviewData.statementLearning} />
                                <DetailItem label="The timetable and scheduling were convenient" value={reviewData.statementTimetable} />
                            </Stack>
                        </Paper>

                        {/* --- Section 4: Enhancement Plans --- */}
                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                            <ThemedPointDisplay title="Enhancement Plans" points={reviewData.enhancePlans} />
                        </Paper>

                        {/* --- Section 5: Evidence & Submission --- */}
                        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                             <Stack spacing={2}>
                                <Typography variant="h6" component="h2">4. Evidence & Submission</Typography>
                                <Divider />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }}>
                                    <DetailItem label="Evidence Upload" value={
                                        reviewData.evidenceUpload ? (
                                            <MuiLink href={`http://localhost:5000/${reviewData.evidenceUpload}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <DescriptionIcon fontSize="small"/>
                                                {reviewData.evidenceUpload_originalName || 'View File'}
                                            </MuiLink>
                                        ) : 'No file uploaded.'
                                    }/>
                                    <DetailItem label="Feedback Upload" value={
                                        reviewData.feedbackUpload ? (
                                            <MuiLink href={`http://localhost:5000/${reviewData.feedbackUpload}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <DescriptionIcon fontSize="small"/>
                                                {reviewData.feedbackUpload_originalName || 'View File'}
                                            </MuiLink>
                                        ) : 'No file uploaded.'
                                    }/>
                                </Stack>
                                <Divider />
                                <DetailItem label="Review Completed By" value={reviewData.completedBy} />
                                <DetailItem label="Last Updated" value={new Date(reviewData.updatedAt).toLocaleString()} />
                             </Stack>
                        </Paper>

                    </Stack>
                )}

            </Collapse>

        </Box>


    // <Stack>
    //     <Typography variant="h4">Module Review</Typography>
    //     {/* Module Search Input */}
        
    //     {/* Error Display */}
    //     <Collapse in={!!error}><Alert severity="warning">{error}</Alert></Collapse>
    //     {/* Review Details Display */}
    //     <Collapse in={!!reviewData}>
    //                 {reviewData && (
    //                     <Grid container spacing={4}>
    //                         {/* Module Info */}
    //                         <Grid item xs={12} md={4}>
    //                             <Stack spacing={2}>
    //                                 <Typography variant="h6">Module Details</Typography>
    //                                 <Divider />
    //                                 <Box>
    //                                     <Typography variant="overline" color="text.secondary">Code</Typography>
    //                                     <Typography variant="h5">{reviewData.module.code}</Typography>
    //                                 </Box>
    //                                 <Box>
    //                                     <Typography variant="overline" color="text.secondary">Title</Typography>
    //                                     <Typography>{reviewData.module.title}</Typography>
    //                                 </Box>
    //                                 <Box>
    //                                     <Typography variant="overline" color="text.secondary">Area</Typography>
    //                                     <Typography>{reviewData.module.area}</Typography>
    //                                 </Box>
    //                                 <Box>
    //                                     <Typography variant="overline" color="text.secondary">Level</Typography>
    //                                     <Typography>{reviewData.module.level}</Typography>
    //                                 </Box>
    //                                 <Box>
    //                                     <Typography variant="overline" color="text.secondary">Module Lead</Typography>
    //                                     <Typography>{reviewData.module.lead.firstName} {reviewData.module.lead.lastName}</Typography>
    //                                 </Box>
    //                                 <Box>
    //                                     <Typography variant="overline" color="text.secondary">Status</Typography>
    //                                     <Typography>{reviewData.status}</Typography>
    //                                 </Box>
    //                             </Stack>
    //                         </Grid>

    //                         {/* Review Content */}
    //                         <Grid item xs={12} md={8}>
    //                             <Stack spacing={3}>
    //                                 <Typography variant="h6">Reflective Analysis</Typography>
    //                                 <Divider />
    //                                 <Box>
    //                                     <Typography variant="subtitle1" gutterBottom>Enhancement Plan Updates</Typography>
    //                                     <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>{reviewData.enhanceUpdate || 'N/A'}</Typography>
    //                                 </Box>
    //                                  <Box>
    //                                     <Typography variant="subtitle1" gutterBottom>Student Attainment</Typography>
    //                                     <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>{reviewData.studentAttainment || 'N/A'}</Typography>
    //                                 </Box>
    //                                  <Box>
    //                                     <Typography variant="subtitle1" gutterBottom>Module Feedback</Typography>
    //                                     <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>{reviewData.moduleFeedback || 'N/A'}</Typography>
    //                                 </Box>
    //                                 <Divider />
    //                             </Stack>
    //                         </Grid>

    //                         <Grid>
    //                             <ThemedPointDisplay title="Good Practice" points={reviewData.goodPractice} />
    //                             <ThemedPointDisplay title="Identified Risks" points={reviewData.risks} />
    //                             <ThemedPointDisplay title="Enhancement Plans" points={reviewData.enhancePlans} />
    //                         </Grid>
    //                     </Grid>
    //                 )}
    //             </Collapse>
    // </Stack>



    );
};

export default GetReview;