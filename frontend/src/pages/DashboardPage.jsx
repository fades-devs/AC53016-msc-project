import React from 'react';
import { Box, Typography, Grid, Stack } from '@mui/material';

// Import dashboard components
import Stats from '../components/Stats';
import GoodPracticeChart from '../components/GoodPracticeChart';
import EnhancementChart from '../components/EnhancementChart';
import CompletionChart from '../components/CompletionChart';

const DashboardPage = () => {
    return (
        // The main Box acts as the page container.
        // respect the padding from App.js's <main> tag.
        <Box sx={{ width: '100%' }}>

            <Stack spacing={4}>
                {/* Page Header */}
                <Typography variant="h4" component="h1">
                    Module Review Dashboard
                </Typography>

                {/* Statistics Section */}
                <Stats />

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
                    <Box sx={{ flex: '1 1 30%', minWidth: '350px', maxWidth: '500px' }}>
                        <GoodPracticeChart />
                    </Box>

                    {/* Enhancement Chart */}
                    <Box sx={{ flex: '1 1 30%', minWidth: '350px', maxWidth: '500px' }}>
                        <EnhancementChart />
                    </Box>

                    {/* Completion Chart */}
                    <Box sx={{ flex: '1 1 30%', minWidth: '350px', maxWidth: '500px' }}>
                        <CompletionChart />
                    </Box>
                </Box>
            </Stack>

        </Box>
    );
};

export default DashboardPage;
