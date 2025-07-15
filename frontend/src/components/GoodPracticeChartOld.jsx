import {useState, useEffect} from 'react';
import axios from 'axios';

import { XAxis, YAxis, BarChart, Bar } from 'recharts';
import {Box, CircularProgress} from '@mui/material';


const GoodPracticeChart = () => {

    // States
    const [goodPractice, setGoodPractice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchGoodPractice = async () => {

            try {
                const response = await axios.get('http://localhost:5000/api/dashboard/stats/goodpractice-by-theme')
                setGoodPractice(response.data);

            }
            catch (err) {
                console.error("Error fetching good practice by theme data:", err);
                setError("Failed to load data. Please try again later.");
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchGoodPractice();


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
        <Box>
            <BarChart width={600} height={300} data={goodPractice}>
                <XAxis dataKey="theme" />
                <YAxis /><Bar dataKey="count" barSize={30} fill="#8884d8"/>
            </BarChart>
        </Box>
    )
}

export default GoodPracticeChart;