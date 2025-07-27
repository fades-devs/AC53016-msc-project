import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Grid, 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    CircularProgress,
    Alert,
    TextField,
    LinearProgress,
    IconButton,
    InputAdornment, Stack, useTheme
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';

// Custom hook for debouncing user input to prevent excessive API calls
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

// A single stat card component for reusability and cleaner code
const StatCard = ({ title, value, subtitle, icon, children }) => {
    // UPDATED: useTheme hook to access theme colors
    const theme = useTheme();

    return (
        // UPDATED: Added width: '100%' to explicitly force the card to fill its container.
        <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1, pr: 2 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>{title}</Typography>
                        <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
                    </Box>
                    <Box sx={{ backgroundColor: theme.palette.action.hover, color: 'primary.main', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                    </Box>
                </Box>
                {children && <Box sx={{ mt: 2 }}>{children}</Box>}
            </CardContent>
        </Card>
    );

};


const Stats = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the year filter, defaulting to the current year
    const [year, setYear] = useState('2025');
    const debouncedYear = useDebounce(year, 500);

    // Fetch stats from the API
    const fetchStats = useCallback(async (yearToFetch) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:5000/api/dashboard/stats?year=${yearToFetch}`);
            setStats(response.data);
        } catch (err) {
            console.error("Error fetching dashboard stats:", err);
            setError("Failed to load statistics. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect to fetch data when the debounced year changes
    useEffect(() => {
        // Ensure we always fetch with a valid year, defaulting to the current year if input is cleared
        const yearToFetch = debouncedYear || new Date().getFullYear().toString();
        fetchStats(yearToFetch);
    }, [debouncedYear, fetchStats]);

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    // Clears the input and refetches for the current year
    const handleClearYear = () => {
        setYear(new Date().getFullYear().toString());
    };

    if (error) {
        return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
    }

    return (
        <Stack spacing={3}>

            {/* Filter Controls */}
            {/* The filter is now in a responsive Grid item, removing the maxWidth limit. */}
            <Grid container>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                        fullWidth
                        label="Filter Stats by Year"
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        variant="outlined"
                    />
                </Grid>
            </Grid>

            {/* STATS CARD */}
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : stats && (
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3, // Use theme spacing unit for gap
                }}>
                    {/* Each StatCard is now a flex item, told to grow and shrink. */}
                    <Box sx={{ flex: '1 1 280px', maxWidth: '450px' }}><StatCard title="Total Modules" value={stats.totalModules} subtitle="All Time" icon={<SchoolIcon fontSize="small"/>} /></Box>
                    <Box sx={{ flex: '1 1 280px', maxWidth: '450px' }}><StatCard title="Total Reviews" value={stats.totalReviewsAllTime} subtitle="All Time, Completed" icon={<RateReviewIcon fontSize="small" />} /></Box>
                    <Box sx={{ flex: '1 1 280px', maxWidth: '450px' }}><StatCard title="Reviews This Year" value={stats.reviewsForYear} subtitle={`Completed in ${stats.year}`} icon={<EventAvailableIcon fontSize="small" />} /></Box>
                    <Box sx={{ flex: '1 1 280px', maxWidth: '450px' }}>
                        <StatCard title="Completion Rate" value={`${stats.completionRate.toFixed(1)}%`} subtitle={`For ${stats.year}`} icon={<CheckCircleOutlineIcon fontSize="small" />}>
                            <LinearProgress variant="determinate" value={stats.completionRate} color="success" sx={{ height: 8, borderRadius: 4 }} />
                        </StatCard>
                    </Box>
                </Box>
            )}
            

        </Stack>
    );
};

export default Stats;