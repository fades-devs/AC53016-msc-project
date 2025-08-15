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
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Checkbox,
    ListItemText, useTheme
} from '@mui/material';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import ClearIcon from '@mui/icons-material/Clear';

import { areaOptions }
from '../constants/filterOptions';

// Custom hook for debouncing user input
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const EnhancementChart = () => {

    const theme = useTheme(); // Use theme for chart colors
    
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for filters, defaulting year and making area an array for multi-select
    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        discipline: []
    });

    const debouncedYear = useDebounce(filters.year, 500);

    // Fetch data from the API based on current filters
    const fetchChartData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        
        if (debouncedYear) {
            params.append('year', debouncedYear);
        }
        
        filters.discipline.forEach(item => params.append('discipline', item));

        try {
            // UPDATED API ENDPOINT
            const response = await axios.get(`http://localhost:5000/api/dashboard/stats/enhancement-by-theme?${params.toString()}`);
            const sortedData = response.data.sort((a, b) => b.count - a.count);
            setChartData(sortedData);
        } catch (err) {
            console.error("Error fetching enhancement data:", err);
            setError("Failed to load chart data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [debouncedYear, JSON.stringify(filters.discipline)]);

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

    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Enhancement Plans by Theme
                </Typography>
                
                {/* Filter Controls */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Year"
                            name="year"
                            type="number"
                            value={filters.year}
                            onChange={handleFilterChange}
                            variant="outlined"
                            fullWidth
                            helperText="Clear to see all years"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {filters.year && (
                                            <IconButton onClick={handleClearYear} edge="end" aria-label="clear year filter">
                                                <ClearIcon />
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" sx={{ minWidth: 120 }}>
                            <InputLabel id="discipline-multi-select-label">Discipline</InputLabel>
                            <Select
                                labelId="discipline-multi-select-label"
                                name="discipline"
                                multiple
                                value={filters.discipline}
                                onChange={handleFilterChange}
                                input={<OutlinedInput label="Discipline" />}
                                renderValue={(selected) => selected.join(', ')}
                            >
                                {areaOptions.map(option => (
                                    <MenuItem key={option} value={option}>
                                        <Checkbox checked={filters.discipline.indexOf(option) > -1} />
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
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis 
                                    type="category" 
                                    dataKey="theme" 
                                    width={100} // Increased width for long labels
                                    tick={{ fontSize: 12 }}
                                    interval={0} // Ensure all labels are shown
                                />
                                <Tooltip cursor={{fill: 'rgba(206, 206, 206, 0.2)'}}
                                    contentStyle={{
                                    borderRadius: '12px',
                                    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
                                    border: '1px solid #e0e0e0'}}/>
                                <Legend />
                                <Bar dataKey="count" name="Occurrences" fill={theme.palette.primary.main} radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default EnhancementChart;
