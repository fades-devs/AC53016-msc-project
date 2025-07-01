import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {
    Box,
    CircularProgress,
    TextField,
    Typography,
    Paper,
    Grid,
    Stack,
    Alert,
    Collapse,
    Divider
} from '@mui/material';

// Reusable component to display themed points
const ThemedPointDisplay = ({ title, points }) => {
    if (!points || points.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            {points.map((point, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 1, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                        {point.theme}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {point.description}
                    </Typography>
                </Paper>
            ))}
        </Box>
    );
};

const GetReview = () => {

    // Custom hook for debouncing input
    const useDebounce = (value, delay) => {
        const [debValue, setDebValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debValue;
    };

    // STATE - for module lookup
    const [moduleCode, setModuleCode] = useState('');
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // Debounce the module code input
    const debModuleCode = useDebounce(moduleCode, 500) // 500ms delay

    // Effect to trigger the review lookup
    useEffect(() => {
        const fetchReview = async () => {
            if (!debModuleCode) {
                setReviewData(null);
                setError('');
                return;
            }
            setLoading(true);
            setError('');
            setReviewData(null);

            try {
            const response = await axios.get(`http://localhost:5000/api/reviews/lookup/by-module?code=${debModuleCode}`);
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

    }, [debModuleCode])


    return (
    <Stack>
        <Typography variant="h4">Module Review</Typography>
        {/* Module Search Input */}
        <Box>
            <TextField fullWidth label="Enter Module Code" variant="outlined" value={moduleCode}
            onChange={(e) => setModuleCode(e.target.value.toUpperCase())}/>
            {loading && <CircularProgress size={24} sx={{ mt: 1 }} />}
        </Box>
        {/* Error Display */}
        <Collapse in={!!error}><Alert severity="warning">{error}</Alert></Collapse>
        {/* Review Details Display */}
        <Collapse in={!!reviewData}>
                    {reviewData && (
                        <Grid container spacing={4}>
                            {/* Module Info */}
                            <Grid item xs={12} md={4}>
                                <Stack spacing={2}>
                                    <Typography variant="h6">Module Details</Typography>
                                    <Divider />
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">Code</Typography>
                                        <Typography variant="h5">{reviewData.module.code}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">Title</Typography>
                                        <Typography>{reviewData.module.title}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">Area</Typography>
                                        <Typography>{reviewData.module.area}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">Level</Typography>
                                        <Typography>{reviewData.module.level}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">Module Lead</Typography>
                                        <Typography>{reviewData.module.lead.firstName} {reviewData.module.lead.lastName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary">Status</Typography>
                                        <Typography>{reviewData.status}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>

                            {/* Review Content */}
                            <Grid item xs={12} md={8}>
                                <Stack spacing={3}>
                                    <Typography variant="h6">Reflective Analysis</Typography>
                                    <Divider />
                                    <Box>
                                        <Typography variant="subtitle1" gutterBottom>Enhancement Plan Updates</Typography>
                                        <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>{reviewData.enhanceUpdate || 'N/A'}</Typography>
                                    </Box>
                                     <Box>
                                        <Typography variant="subtitle1" gutterBottom>Student Attainment</Typography>
                                        <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>{reviewData.studentAttainment || 'N/A'}</Typography>
                                    </Box>
                                     <Box>
                                        <Typography variant="subtitle1" gutterBottom>Module Feedback</Typography>
                                        <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>{reviewData.moduleFeedback || 'N/A'}</Typography>
                                    </Box>
                                    <Divider />
                                </Stack>
                            </Grid>

                            <Grid>
                                <ThemedPointDisplay title="Good Practice" points={reviewData.goodPractice} />
                                <ThemedPointDisplay title="Identified Risks" points={reviewData.risks} />
                                <ThemedPointDisplay title="Enhancement Plans" points={reviewData.enhancePlans} />
                            </Grid>
                        </Grid>
                    )}
                </Collapse>
    </Stack>
    )
}

export default GetReview;