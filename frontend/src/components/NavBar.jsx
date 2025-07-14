import { useState } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    IconButton, 
    Menu, 
    MenuItem,
    Box 
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// Import necessary icons
import AdbIcon from '@mui/icons-material/Adb'; // Example logo icon
import AccountCircle from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

/**
 * A responsive navigation bar component built with Material-UI.
 * It includes a logo, a dashboard link, a "Modules" dropdown menu,
 * and a user profile dropdown menu.
 */
const NavBar = () => {

    // Hook for programmatic navigation
    const navigate = useNavigate();

    // State management for the "Modules" dropdown menu
    const [modulesMenuAnchorEl, setModulesMenuAnchorEl] = useState(null);
    const isModulesMenuOpen = Boolean(modulesMenuAnchorEl);

    // State management for the "Profile" dropdown menu
    const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
    const isProfileMenuOpen = Boolean(profileMenuAnchorEl);

    // --- Handlers for Modules Menu ---
    const handleModulesMenuOpen = (event) => {
        setModulesMenuAnchorEl(event.currentTarget);
    };
    const handleModulesMenuClose = () => {
        setModulesMenuAnchorEl(null);
    };

    // --- Handlers for Profile Menu ---
    const handleProfileMenuOpen = (event) => {
        setProfileMenuAnchorEl(event.currentTarget);
    };
    const handleProfileMenuClose = () => {
        setProfileMenuAnchorEl(null);
    };

    // --- Navigation Handlers ---
    // This function closes the menu and then navigates
    const handleNavigate = (path) => {
        handleModulesMenuClose();
        handleProfileMenuClose();
        navigate(path);
    };

    return (
        // AppBar provides the main top bar structure
        <AppBar position="static" sx={{ backgroundColor: '#FFFFFF', color: '#333333' }}>
            <Toolbar>
                {/* --- Logo and App Name --- */}
                <Typography variant="h6" component={RouterLink} to="/dashboard" sx={{flexGrow: 1, textDecoration: 'none',
                        color: 'inherit', '&:hover': { color: 'primary.main',},}}>Enhancement Dashboard</Typography>
                {/* --- Navigation Links --- */}
                <Box>
                    {/* Dashboard Link */}
                    <Button color="inherit" component={RouterLink} to="/dashboard">Dashboard</Button>
                    {/* Modules Dropdown Button */}
                    <Button color="inherit" onClick={handleModulesMenuOpen} endIcon={<ArrowDropDownIcon />}>Modules</Button>
                    {/* Modules Menu */}
                    <Menu anchorEl={modulesMenuAnchorEl} open={isModulesMenuOpen} onClose={handleModulesMenuClose}
                        MenuListProps={{ 'aria-labelledby': 'modules-button' }}>
                        <MenuItem onClick={() => handleNavigate('/module-list')}>Module List</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/create-review')}>Submit Review</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/get-review')}>View Reports</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/send-reminder')}>Send Reminders</MenuItem>
                    </Menu>
                </Box>
                {/* --- Profile Icon and Dropdown --- */}
                <Box sx={{ ml: 2 }}>
                    <IconButton size="large" edge="end" aria-label="account of current user" aria-controls="profile-menu"
                        aria-haspopup="true" onClick={handleProfileMenuOpen} color="inherit">
                        <AccountCircle />
                    </IconButton>
                    {/* Profile Menu */}
                    <Menu id="profile-menu" anchorEl={profileMenuAnchorEl} anchorOrigin={{vertical: 'bottom', horizontal: 'right',}}
                        transformOrigin={{vertical: 'top', horizontal: 'right',}} open={isProfileMenuOpen}
                        onClose={handleProfileMenuClose}>
                        <MenuItem onClick={() => handleNavigate('/account')}>Account</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/settings')}>Settings</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/logout')}>Log Out</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    )




}

export default NavBar;
