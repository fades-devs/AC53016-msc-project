import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

// Import your dashboard components
import Stats from '../components/Stats';
import GoodPracticeChart from '../components/GoodPracticeChart';
import EnhancementChart from '../components/EnhancementChart';
import CompletionChart from '../components/CompletionChart';

const DashboardPage = () => {
    return (
        // The main Box now acts as the page container.
        // It will respect the padding from your App.js's <main> tag.
        <Box sx={{ flexGrow: 1 }}>
            {/* Page Header */}
            <Typography 
                variant="h4" 
                sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary' }}
            >
                Module Review Dashboard
            </Typography>

            {/* Statistics Section */}
            <Box sx={{ mb: 4 }}>
                <Stats />
            </Box>

            {/* Charts Section - UPDATED to use a flexbox layout */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    flexWrap: 'wrap', 
                    gap: 4, // This creates space between the items
                    alignItems: 'stretch' // Ensures all cards in a row are the same height
                }}
            >
                {/* Each chart is a flex item. The 'flex' property controls how they grow and shrink. */}
                {/* '1 1 30%' means: grow, shrink, and have a base width of about 30%. */}
                {/* 'minWidth' ensures they don't get too small before wrapping. */}
                
                {/* Good Practice Chart */}
                <Box sx={{ flex: '1 1 30%', minWidth: '350px' }}>
                    <GoodPracticeChart />
                </Box>

                {/* Enhancement Chart */}
                <Box sx={{ flex: '1 1 30%', minWidth: '350px' }}>
                    <EnhancementChart />
                </Box>

                {/* Completion Chart */}
                <Box sx={{ flex: '1 1 30%', minWidth: '350px' }}>
                    <CompletionChart />
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardPage;
