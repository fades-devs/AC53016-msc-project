import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Chip, Stack,
  Button, Pagination, Alert, useTheme // Import useTheme
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { Link } from 'react-router-dom';
import ModuleFilterControls from '../components/ModuleFilterControls';

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

// Helper object for Chip colors to keep render logic clean
const statusColors = {
  'Completed': 'success',
  'In Progress': 'warning',
  'Not Started': 'default',
};

const ModuleListPage = () => {

    const theme = useTheme(); // Hook to access theme properties
  
    const initialFilters = {area: [], level: [], period: [], location: [], status: [],
        titleSearch: '', codeSearch: '', leadSearch: '', year: new Date().getFullYear(), // Default to current year
    }

    const [filters, setFilters] = useState(initialFilters);

    // STATE FOR PAGINATION
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage] = useState(20); // Define how many items per page

    // State to hold the list of modules
    const [modules, setModules] = useState([]);
    // --- Differentiated loading states ---
    const [initialLoading, setInitialLoading] = useState(true); // For the first page load
    const [isFiltering, setIsFiltering] = useState(false); // For subsequent background searches
    const [error, setError] = useState(null);

    // Debounce only the user-typed inputs - 500ms delay
    const titleSearchDeb = useDebounce(filters.titleSearch, 500);
    const codeSearchDeb = useDebounce(filters.codeSearch, 500);
    const leadSearchDeb = useDebounce(filters.leadSearch, 500);
    const yearDeb = useDebounce(filters.year, 500)

    const fetchModules = useCallback(async() => {
        // --- Set filtering state, not the main loading state ---
        setIsFiltering(true);
        setError(null);

        try {
                const params = new URLSearchParams();

                // Add page and limit to API request
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

                // Set state from response object (data from API)
                setModules(response.data.modules);
                setTotalPages(response.data.totalPages);

            }
        catch (err) {
            setError('Error in fetching modules. Please ensure the server is running.');
            console.error(err);
        }
        finally {
            // --- Set to false once request is complete - both loading states ---
            setInitialLoading(false);
            setIsFiltering(false);
        }
    },
    [ // Depend on the current page
        page, itemsPerPage,
        // --- Dependency array stringifies filters to correctly detect changes in arrays ---
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
        // Reset to page 1 whenever filter changes
        setPage(1);
    };

    // Function to clear all filters ---
    const handleClearFilters = () => {
        setFilters(initialFilters);
        //: reset to page 1 when clearing filters
        setPage(1);
    };

    // --- Handler for the Pagination component ---
    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // Helper function that decides which button to show
    const renderActions = (module) => {
        switch (module.status) {
        case 'Completed':
            return (
            <Stack>
                <Button size="medium" variant="text" component={Link} to={`/get-review?code=${module.code}&year=${module.year}`}
                target='_blank'>View Report</Button>
                <Button size="medium" variant="text" component={Link} to={`/edit-review/${module.reviewId}`} target='_blank'>
                Edit Report</Button>
            </Stack>
            );
        case 'In Progress':
            return <Button size="medium" variant="text" component={Link} to={`/edit-review/${module.reviewId}`} target='_blank'>
                Continue Review</Button>;
        case 'Not Started':
            return <Button size="medium" variant="contained" component={Link} to={`/create-review/${module.code}`} target='_blank'>
                Start Review</Button>;
        default:
            return null;
        }
    };

    // --- Only show full-screen loader on initial load ---
    if (initialLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <CircularProgress />
            </Box>
        )
    }

    // Use the themed Alert component for errors
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }


    // main page render
    return (

    <Box>

        {/* 1. Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" component="h1">Module Reviews</Typography>
            <Button
            variant="contained"
            color="primary" // Uses theme color
            component={Link}
            to="/send-reminder"
            startIcon={<EmailIcon />}
            >
            Send Reminders
            </Button>
        </Box>

        {/* 2. Filter Component */}
        <ModuleFilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
        />

        {/* 3. Results Table */}
        <Box sx={{ position: 'relative' }}>
            {/* Use theme colors for the loading overlay */}
            {isFiltering && (
            <Box sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'action.hover', // Use a theme token for the overlay
                zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <CircularProgress />
            </Box>
            )}
            <TableContainer component={Paper} variant="outlined">
            <Table stickyHeader>
                <TableHead>
                <TableRow>
                    {['Module Code', 'Module Title', 'Level', 'Module Lead', 'Review Status', 'Actions'].map(headCell => (
                    <TableCell key={headCell} sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>
                        {headCell}
                    </TableCell>
                    ))}
                </TableRow>
                </TableHead>
                <TableBody>
                {modules.map((module) => (
                    <TableRow hover key={`${module._id}`}>
                    <TableCell>{module.code}</TableCell>
                    <TableCell>{module.title}</TableCell>
                    <TableCell>{module.level}</TableCell>
                    <TableCell>{module.moduleLead}</TableCell>
                    <TableCell>
                        <Chip label={module.status} color={statusColors[module.status] || 'default'} />
                    </TableCell>
                    <TableCell align="center">{renderActions(module)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>

        </Box>

        {/* 4. Pagination */}
        {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton showLastButton
            />
            </Box>
        )}

    </Box>

    )
}

export default ModuleListPage