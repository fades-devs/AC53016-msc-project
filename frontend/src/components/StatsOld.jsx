import {useState, useEffect} from 'react';
import axios from 'axios';
import { 
    Grid, 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    LinearProgress,
    CircularProgress,
    Alert
} from '@mui/material';

const Stats = () => {

    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {

            try {
                const response = await axios.get('http://localhost:5000/api/dashboard/stats');
                setStats(response.data);
            }
            catch (err) {
                console.error("Error fetching dashboard stats:", err);
                setError("Failed to load statistics. Please try again later.");
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchStats();

    }, []);

    if (isLoading) {
        return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
        </Box>
        );
    }
    if (error) {
        return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
    }

    return (
        <Box sx={{ flexGrow: 1, my: 2 }}>
            <Grid container spacing={3}>
                {/* Card 1: Total Modules */}
                <Grid>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" component="div">Total Modules</Typography>
                            </Box>
                            <Typography variant="h4" component="p">{stats.totalModules}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Card 2: Total Reviews */}
                <Grid>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" component="div">Total Reviews</Typography>
                            </Box>
                            <Typography variant="h4" component="p">{stats.totalReviews}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Card 3: Completion Rate */}
                <Grid>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" component="div">Completion Rate</Typography>
                            </Box>
                            <Typography variant="h4" component="p">{stats.completionRate.toFixed(1)}%</Typography>
                            <Box sx={{ width: '100%', mt: 2 }}>
                                <LinearProgress variant="determinate" value={stats.completionRate} color="success"/>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )

}

export default Stats;