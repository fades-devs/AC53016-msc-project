import Stats from '../components/Stats';
import GoodPracticeChart from '../components/GoodPracticeChart';
import EnhancementChart from '../components/EnhancementChart';
import CompletionChart from '../components/CompletionChart';
import { Typography, Box, Divider, Grid, Card, CardContent } from '@mui/material';

const DashboardPage = () => {
    return (
        <Box>
            <Typography variant="h4">Module Review Dashboard</Typography>
            <Divider/>
            <Stats />
            <Divider/>
            <Grid container spacing={3}>
                <Card>
                    <CardContent>
                        <GoodPracticeChart/>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <EnhancementChart/>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <CompletionChart/>
                    </CardContent>
                </Card>
            </Grid>
        </Box>
    )
}

export default DashboardPage;