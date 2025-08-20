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
    FormControl, InputLabel, Select,
    OutlinedInput, MenuItem,
    Checkbox, ListItemText,
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

import { areaOptions }
from '../constants/filterOptions';

// Define consistent colors for each status
const STATUS_COLORS = {
    'Completed': '#2e7d32',
    'In Progress': '#ed6c02',
    'Not Started': '#bdbdbd',
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

    const STATUS_COLORS = {
        'Completed': theme.palette.success.main,
        'In Progress': theme.palette.warning.main,
        'Not Started': theme.palette.grey[400],
    };

    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        area: [] 
    });
    

    const debouncedYear = useDebounce(filters.year, 500);

    const fetchChartData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        // Only append the year parameter if it has a value
        if (debouncedYear) {
            params.append('year', debouncedYear);
        }

        filters.area.forEach(item => params.append('area', item));

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
    }, [debouncedYear, JSON.stringify(filters.area)]);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };
    
    const handleClearYear = () => {
         setFilters(prev => ({...prev, year: ''}));
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
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Module Status Overview
                </Typography>
                
                {/* Filter Controls */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Year"
                            name="year"
                            type="number"
                            value={filters.year}
                            onChange={handleFilterChange}
                            variant="outlined"
                            fullWidth
                            helperText="Enter the desired year"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" sx={{ minWidth: 120 }}>
                            <InputLabel id="area-multi-select-label">Discipline</InputLabel>
                            <Select
                                labelId="area-multi-select-label"
                                name="area"
                                multiple
                                value={filters.area}
                                onChange={handleFilterChange}
                                input={<OutlinedInput label="Discipline" />}
                                renderValue={(selected) => selected.length > 1 ? `${selected.length} selected` : selected.join(', ')}
                            >
                                {areaOptions.map(option => (
                                    <MenuItem key={option} value={option}>
                                        <Checkbox checked={filters.area.indexOf(option) > -1} />
                                        <ListItemText primary={option} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
