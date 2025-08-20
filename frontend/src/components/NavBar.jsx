import { useState } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    IconButton, 
    Menu, 
    MenuItem,
    Box, useTheme, Container
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// Import necessary icons
import AdbIcon from '@mui/icons-material/Adb'; // Example logo icon
import AccountCircle from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu'; // For the mobile hamburger menu
import SchoolIcon from '@mui/icons-material/School'; // An icon for the logo

const NavBar = () => {

    const theme = useTheme(); // Access the theme for brand colors

    // Hook for programmatic navigation
    const navigate = useNavigate();

    // State for the main "Modules" dropdown menu
    const [modulesMenuAnchorEl, setModulesMenuAnchorEl] = useState(null);
    const isModulesMenuOpen = Boolean(modulesMenuAnchorEl);

    // State for the mobile navigation menu
    const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
    const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);

    // --- Handlers for Modules Menu (Desktop) ---
    const handleModulesMenuOpen = (event) => setModulesMenuAnchorEl(event.currentTarget);
    const handleModulesMenuClose = () => setModulesMenuAnchorEl(null);

    // --- Handlers for Mobile Menu ---
    const handleMobileMenuOpen = (event) => setMobileMenuAnchorEl(event.currentTarget);
    const handleMobileMenuClose = () => setMobileMenuAnchorEl(null);

    // --- Navigation Handler ---
    const handleNavigate = (path) => {
        // Close both menus, then navigate
        handleModulesMenuClose();
        handleMobileMenuClose();
        navigate(path);
    };

    return (
        // AppBar uses theme colors for a consistent look
        <AppBar position="static" elevation={0} color="default" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            <Container maxWidth={false}>
                <Toolbar disableGutters>
                    {/* --- Logo and App Name --- */}
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ color: 'primary.main', mr: 1, fontSize: '2rem' }} />
                        <Typography
                            variant="h6"
                            component={RouterLink}
                            to="/dashboard"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                '&:hover': { color: 'primary.main' },
                            }}
                        >
                            Module Enhancement
                        </Typography>
                    </Box>

                    {/* --- Desktop Navigation Links --- */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <Button color="inherit" component={RouterLink} sx={{ fontSize: '1rem', fontWeight: 600 }}
                         to="/dashboard">Dashboard</Button>
                        <Button color="inherit" onClick={handleModulesMenuOpen} sx={{ fontSize: '1rem', fontWeight: 600 }}
                         endIcon={<ArrowDropDownIcon />}>Modules</Button>
                    </Box>

                    {/* --- Mobile Navigation (Hamburger Menu) --- */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="navigation menu"
                            aria-controls="mobile-menu"
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>

                    {/* Modules Menu (for Desktop) */}
                    <Menu
                        anchorEl={modulesMenuAnchorEl}
                        open={isModulesMenuOpen}
                        onClose={handleModulesMenuClose}
                        MenuListProps={{ 'aria-labelledby': 'modules-button' }}
                    >
                        {/* Larger menu items with more padding */}
                        <MenuItem onClick={() => handleNavigate('/module-list')} sx={{ fontSize: '1rem', py: 1 }}>Module List</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/create-review')} sx={{ fontSize: '1rem', py: 1 }}>Submit Review</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/get-review')} sx={{ fontSize: '1rem', py: 1 }}>View Reports</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/send-reminder')} sx={{ fontSize: '1rem', py: 1 }}>Send Reminders</MenuItem>
                    </Menu>

                    {/* Mobile Menu (for smaller screens) */}
                    <Menu
                        id="mobile-menu"
                        anchorEl={mobileMenuAnchorEl}
                        open={isMobileMenuOpen}
                        onClose={handleMobileMenuClose}
                        sx={{ display: { xs: 'block', md: 'none' } }}
                    >
                        <MenuItem onClick={() => handleNavigate('/dashboard')} sx={{ fontSize: '1rem', py: 1 }}>Dashboard</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/module-list')} sx={{ fontSize: '1rem', py: 1 }}>Module List</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/create-review')} sx={{ fontSize: '1rem', py: 1 }}>Submit Review</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/get-review')} sx={{ fontSize: '1rem', py: 1 }}>View Reports</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/send-reminder')} sx={{ fontSize: '1rem', py: 1 }}>Send Reminders</MenuItem>
                    </Menu>
                </Toolbar>
            </Container>
        </AppBar>
    );




}

export default NavBar;
