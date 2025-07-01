import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {Container, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, CircularProgress, Chip, Stack, Button, Grid,
FormControl, InputLabel, Select, MenuItem, TextField} from '@mui/material';


// Custom hook for debouncing
const useDebounce = (value, delay) => {
    const [debValue, setDebValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debValue;
};

const ModuleListPage = () => {
  
    const [filters, setFilters] = useState({
        area: '', level: '', period: '', status: '', year: '', moduleSearch: '', leadSearch: ''
    });

    const moduleSearchDeb = useDebounce(filters.moduleSearch, 500);
    const leadSearchDeb = useDebounce(filters.leadSearch, 500);
    const yearDeb = useDebounce(filters.year, 500)

    // State to hold the list of modules
    const [modules, setModules] = useState([]);
    // State to manage the loading status
    const [loading, setLoading] = useState(true);
    // State to hold any potential errors
    const [error, setError] = useState(null);

    const fetchModules = useCallback(async() => {
        
        setLoading(true);
        setError(null);

        try {
                const params = new URLSearchParams();
                if (filters.area) {params.append('area', filters.area)};
                if (filters.level) {params.append('level', filters.level)};
                if (filters.period) {params.append('period', filters.period)};
                if (filters.status) {params.append('status', filters.status)};
                if (yearDeb) {params.append('year', yearDeb)};
                if (moduleSearchDeb) {params.append('moduleSearch', moduleSearchDeb)};
                if (leadSearchDeb) {params.append('leadSearch', leadSearchDeb)};

                // GET request to the backend API
                const response = await axios.get(`http://localhost:5000/api/modules?${params.toString()}`);
                // Update state with the data from the API
                setModules(response.data);
            }
        catch (err) {
            setError('Error in fetching modules. Please ensure the server is running.');
            console.error(err);
        }
        finally {
            setLoading(false); // Set loading to false once request is complete
        }
    },
    [filters.area, filters.level, filters.period, filters.status, yearDeb, moduleSearchDeb, leadSearchDeb]
    );

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    // Helper function that decides which button to show
    const renderActions = (module) => {
        switch(module.status) {
            case 'Completed':
                return (
                    <Stack direction="column">
                        <Button align="center" size="small" onClick={() => alert('Update later')}>View Report</Button>
                        <Button align="center" size="small" onClick={() => alert('Update later')}>Edit Report</Button>
                    </Stack>
                );
            case 'In Progress':
                return (
                    <Stack direction="column">
                        <Button align="center" size="small" onClick={() => alert('Update later')}>Continue Review</Button>
                    </Stack>
                );
            case 'Not Started':
                return (
                    <Stack direction="column">
                        <Button align="center" size="small" onClick={() => alert('Update later')}>Submit Review</Button>
                    </Stack>
                );
            default:
                return null;
        };
    };


    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress />
            </Box>
        )
    }
    if (error) {
        return (
            <Container>
                <Typography align='center'>{error}</Typography>
            </Container>
        )
    }

    return (
       <Container sx={{ mt: 4 }}>
        <Typography variant="h4">
            Module Enhancement Review
        </Typography>
        <Box>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="area-label">Area</InputLabel>
                <Select name="area" value={filters.area} onChange={handleFilterChange} label="Area">
                    <MenuItem value=""><em>All Areas</em></MenuItem>
                    <MenuItem value="Computing">Computing</MenuItem>
                    <MenuItem value="Anatomy">Anatomy</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="level-label">Level</InputLabel>
                <Select name="level" value={filters.level} onChange={handleFilterChange} label="Level">
                    <MenuItem value=""><em>All Levels</em></MenuItem>
                    <MenuItem value="1">Level 1</MenuItem>
                    <MenuItem value="2">Level 2</MenuItem>
                    <MenuItem value="2">Level 5</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select name="period" value={filters.period} onChange={handleFilterChange} label="Period">
                    <MenuItem value=""><em>All Periods</em></MenuItem>
                    <MenuItem value="Semester 1">Semester 1</MenuItem>
                    <MenuItem value="Semester 2">Semester 2</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={filters.status} onChange={handleFilterChange} label="Status">
                    <MenuItem value=""><em>All Status</em></MenuItem>
                    <MenuItem value="Not Started">Not Started</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                </Select>
            </FormControl>
            <Grid item xs={12} sm={6} md={3}>
                <TextField label="Year" name="year" type="number" value={filters.year} onChange={handleFilterChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField label="Module Search" name="moduleSearch" value={filters.moduleSearch} onChange={handleFilterChange} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <TextField label="Lead Search" name="leadSearch" value={filters.leadSearch} onChange={handleFilterChange} />
            </Grid>
        </Box>

        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Module Code</TableCell>
                        <TableCell>Module Title</TableCell>
                        <TableCell>Module Lead</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        modules.map((module) => (
                            <TableRow key={module._id}>
                                <TableCell>{module.code}</TableCell>
                                <TableCell>{module.title}</TableCell>
                                <TableCell>{module.moduleLead}</TableCell>
                                <TableCell title={module.date}>
                                    <Chip label={module.status}></Chip>
                                </TableCell>
                                <TableCell>{renderActions(module)}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
       </Container>
    )


}

export default ModuleListPage