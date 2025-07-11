import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {Container, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, CircularProgress, Chip, Stack, Button, Grid,
FormControl, InputLabel, Select, MenuItem, TextField, OutlinedInput, Checkbox, ListItemText, Pagination} from '@mui/material';

// --- UPDATE: Import the options from your constants file ---
import { areaOptions, levelOptions, periodOptions, locationOptions, statusOptions }
from '../constants/filterOptions';

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
  
    const initialFilters = {area: [], level: [], period: [], location: [], status: [],
        titleSearch: '', codeSearch: '', leadSearch: '', year: new Date().getFullYear(), // Default to current year
    }

    const [filters, setFilters] = useState(initialFilters);

    // UPDATE: STATE FOR PAGINATION
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage] = useState(20); // Define how many items per page

    // Debounce only the user-typed inputs - 500ms delay
    const titleSearchDeb = useDebounce(filters.titleSearch, 500);
    const codeSearchDeb = useDebounce(filters.codeSearch, 500);
    const leadSearchDeb = useDebounce(filters.leadSearch, 500);
    const yearDeb = useDebounce(filters.year, 500)

    // State to hold the list of modules
    const [modules, setModules] = useState([]);
    // --- UPDATE: Differentiated loading states ---
    const [initialLoading, setInitialLoading] = useState(true); // For the first page load
    const [isFiltering, setIsFiltering] = useState(false); // For subsequent background searches
    const [error, setError] = useState(null);

    const fetchModules = useCallback(async() => {
        // --- UPDATE: Set filtering state, not the main loading state ---
        setIsFiltering(true);
        setError(null);

        try {
                const params = new URLSearchParams();

                // UPDATE: add page and limit to API request
                params.append('page', page);
                params.append('limit', itemsPerPage);

                // Handle array filters
                filters.area.forEach(item => params.append('area', item));
                filters.level.forEach(item => params.append('level', item));
                filters.period.forEach(item => params.append('period', item));
                filters.location.forEach(item => params.append('location', item));
                filters.status.forEach(item => params.append('status', item));

                // Handle debounced text/number filters
                if (yearDeb) {params.append('year', yearDeb)}; // will always have initial value
                if (codeSearchDeb) {params.append('codeSearch', codeSearchDeb)};
                if (titleSearchDeb) {params.append('titleSearch', titleSearchDeb)};
                if (leadSearchDeb) {params.append('leadSearch', leadSearchDeb)};

                // GET request to the backend API
                const response = await axios.get(`http://localhost:5000/api/modules?${params.toString()}`);

                // UPDATE: set state from response object (data from API)
                setModules(response.data.modules);
                setTotalPages(response.data.totalPages);

            }
        catch (err) {
            setError('Error in fetching modules. Please ensure the server is running.');
            console.error(err);
        }
        finally {
            // --- UPDATE: set to false once request is complete - both loading states ---
            setInitialLoading(false);
            setIsFiltering(false);
        }
    },
    [ // UPDATE: Depend on the current page
        page, itemsPerPage,
        // --- UPDATE: Dependency array now stringifies filters to correctly detect changes in arrays ---
        JSON.stringify(filters.area), JSON.stringify(filters.level), JSON.stringify(filters.period), 
        JSON.stringify(filters.location), JSON.stringify(filters.status),
        yearDeb, codeSearchDeb, titleSearchDeb, leadSearchDeb]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
        // UPDATE: reset to page 1 whenever filter changes
        setPage(1);
    };

    // Function to clear all filters ---
    const handleClearFilters = () => {
        setFilters(initialFilters);
        // UPDATE: reset to page 1 when clearing filters
        setPage(1);
    };

    // --- UPDATE: Handler for the Pagination component ---
    const handlePageChange = (event, value) => {
        setPage(value);
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

    // --- UPDATE: Only show full-screen loader on initial load ---
    if (initialLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
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
        {/* --- UPDATE: Filter controls wrapped in Grid for better layout --- */}
        <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="flex-end">
                {/* --- UPDATE: All Select components now support multi-select --- */}
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="area-label">Area</InputLabel>
                    <Select name="area" value={filters.area} onChange={handleFilterChange} label="Area"
                    input={<OutlinedInput label="Area" />} multiple renderValue={(selected) => selected.join(', ')}>
                        {areaOptions.map((name) => (
                            <MenuItem key={name} value={name}>
                                <Checkbox checked={filters.area.indexOf(name) > -1} />
                                <ListItemText primary={name} />
                            </MenuItem>))}
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="level-label">Level</InputLabel>
                    <Select name="level" value={filters.level} onChange={handleFilterChange} label="Level"
                    input={<OutlinedInput label="Level" />} multiple renderValue={(selected) => selected.join(', ')}>
                        {levelOptions.map((level) => (
                            <MenuItem key={level} value={level}>
                                <Checkbox checked={filters.level.indexOf(level) > -1} />
                                <ListItemText primary={level} />
                            </MenuItem>))}
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="period-label">Period</InputLabel>
                    <Select name="period" value={filters.period} onChange={handleFilterChange} label="Period"
                    input={<OutlinedInput label="Period" />} multiple renderValue={(selected) => selected.join(', ')}>
                        {periodOptions.map((name) => (
                            <MenuItem key={name} value={name}>
                                <Checkbox checked={filters.period.indexOf(name) > -1} />
                                <ListItemText primary={name} />
                            </MenuItem>))}
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="location-label">Location</InputLabel>
                    <Select name="location" value={filters.location} onChange={handleFilterChange} label="Location"
                    input={<OutlinedInput label="Location" />} multiple renderValue={(selected) => selected.join(', ')}>
                        {locationOptions.map((name) => (
                            <MenuItem key={name} value={name}>
                                <Checkbox checked={filters.location.indexOf(name) > -1} />
                                <ListItemText primary={name} />
                            </MenuItem>))}
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select name="status" value={filters.status} onChange={handleFilterChange} label="Status"
                    input={<OutlinedInput label="Status" />} multiple renderValue={(selected) => selected.join(', ')}>
                        {statusOptions.map((name) => (
                            <MenuItem key={name} value={name}>
                                <Checkbox checked={filters.status.indexOf(name) > -1} />
                                <ListItemText primary={name} />
                            </MenuItem>))}
                    </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Year" name="year" type="number" value={filters.year} onChange={handleFilterChange} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Module Title" name="titleSearch" value={filters.titleSearch} onChange={handleFilterChange} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Module Code" name="codeSearch" value={filters.codeSearch} onChange={handleFilterChange} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Module Lead" name="leadSearch" value={filters.leadSearch} onChange={handleFilterChange} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    {/* --- UPDATE: Clear Filters Button --- */}
                    <Button fullWidth variant="outlined" onClick={handleClearFilters} sx={{ height: '56px' }}>
                        Clear
                    </Button>
                </Grid>
            </Grid>
        </Box>

        <Box sx={{ position: 'relative' }}>
            {isFiltering && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 1, display: 'flex',
                        alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>)}
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Lead</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            modules.map((module) => (
                                // The key now includes the module ID, the variant code, and the unique review ID.
                                // We use a fallback ('no-review') for modules that haven't been reviewed yet.
                                <TableRow hover key={`${module._id}-${module.code}-${module.reviewId || 'no-review'}`}>
                                    <TableCell>{module.code}</TableCell>
                                    <TableCell>{module.title}</TableCell>
                                    <TableCell title={module.period}>{module.level}</TableCell>
                                    <TableCell>{module.moduleLead}</TableCell>
                                    <TableCell title={module.reviewDate ? new Date(module.reviewDate).toLocaleDateString() : 'No review date'}>
                                        <Chip label={module.status} color={
                                            module.status === 'Completed' ? 'success' :
                                            module.status === 'In Progress' ? 'warning' : 'default'}>
                                        </Chip>
                                    </TableCell>
                                    <TableCell>{renderActions(module)}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>

        {/* --- UPDATE: Pagination Component --- */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"
            showFirstButton showLastButton />
        </Box>

    </Container>
    )


}

export default ModuleListPage