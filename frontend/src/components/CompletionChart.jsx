import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Box, 
    CircularProgress, 
    Alert, 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    TextField,
    IconButton,
    InputAdornment,
    useTheme
} from '@mui/material';
import { 
    PieChart, 
    Pie, 
    Cell,
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import ClearIcon from '@mui/icons-material/Clear';

// Define consistent colors for each status
const STATUS_COLORS = {
    'Completed': '#2e7d32', // nice green
    'In Progress': '#ed6c02', // warm orange
    'Not Started': '#bdbdbd', // neutral grey
};

// Custom hook for debouncing user input
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const CompletionChart = () => {
    const theme = useTheme();
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Updated filters state to only include year
    const [year, setYear] = useState(new Date().getFullYear().toString());

    const debouncedYear = useDebounce(year, 500);

    const fetchChartData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        // Only append the year parameter if it has a value
        if (debouncedYear) {
            params.append('year', debouncedYear);
        }

        try {
            // The API endpoint remains the same
            const response = await axios.get(`http://localhost:5000/api/dashboard/stats/review-by-status?${params.toString()}`);
            setChartData(response.data);
        } catch (err) {
            console.error("Error fetching completion data:", err);
            setError("Failed to load chart data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [debouncedYear]);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };
    
    const handleClearYear = () => {
         setYear('');
    };
    
    // Custom Tooltip for better styling
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: '8px', boxShadow: 3 }}>
                    <Typography variant="body1">{`${payload[0].name}: ${payload[0].value}`}</Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Card sx={{ borderRadius: '16px', boxShadow: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Module Status Overview
                </Typography>
                
                {/* Filter Controls - Area filter removed */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Year"
                            name="year"
                            type="number"
                            value={year}
                            onChange={handleYearChange}
                            variant="outlined"
                            fullWidth
                            helperText="Enter the desired year"
                        />
                    </Grid>
                </Grid>

                {/* Chart Area */}
                <Box sx={{ height: 400, position: 'relative' }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : chartData.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                           <Typography color="text.secondary">No data available for the selected filters.</Typography>
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || theme.palette.divider} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default CompletionChart;
