import {useState, useEffect} from 'react';
import axios from 'axios';
import {PieChart, Pie} from 'recharts';
import {Box, CircularProgress} from '@mui/material';

const CompletionChart = () => {

    // States
    const [completion, setCompletion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchCompletion = async () => {

            try {
                const response = await axios.get('http://localhost:5000/api/dashboard/stats/review-by-status')
                setCompletion(response.data);

            }
            catch (err) {
                console.error("Error fetching review by status data:", err);
                setError("Failed to load data. Please try again later.");
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchCompletion();


    }, []);

    if (isLoading) {
            return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
            </Box>
            );
        }
        // MUI Alert for a clear error message
        if (error) {
            return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
        }

    return (
        <Box>
            <PieChart width={400} height={400}>
                <Pie
                    dataKey="count"
                    data={completion}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                />
            </PieChart>
        </Box>
    )
}

export default CompletionChart;