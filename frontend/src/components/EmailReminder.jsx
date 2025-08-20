import { useState, useEffect } from 'react';
import axios from 'axios';
import { Stack, Typography, Box, Paper, Button, CircularProgress, List, ListItem, ListItemText, Collapse } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// The email template to be displayed and sent
import { emailSubject, emailMessageHtml, reviewSystemLink } from '../constants/emailOptions';

const EmailReminder = () => {

    // state for list of emails
    const [recipientEmails, setRecipientEmails] = useState([]);
    const [showAllEmails, setShowAllEmails] = useState(false);

    // State for loading and sending status
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    // Fetch the list of emails when the component mounts
    useEffect(() => {
        const fetchEmails = async () => {
            try {
                // Use the correct endpoint for get-emails-for-reminder API
                const response = await axios.get('http://localhost:5000/api/email/incomplete'); 
                setRecipientEmails(response.data);
            }
            catch (err) {
                setError('Failed to fetch recipient list.');
                console.error(err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchEmails();
    }, []);

    // Handle the send button click
    const handleSendReminders = async () => {

        setIsSending(true);
        setError(null);

        try {

            // This API call triggers the backend to fetch the list and send
            const response = await axios.post('http://localhost:5000/api/email/send');
            alert(response.data.message); // Show success message

        }
        catch (err) {
            setError('An error occurred while sending emails.');
            console.error(err);
            alert('An error occurred. Please check the console.');
        }
        finally {
            setIsSending(false);
        }

    };

    // Centered full-page loader for better UX
    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }
    
    // Using the Alert component for a consistent error message style
    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    return (

        <Stack spacing={4}>

            <Box>
                <Typography variant="h4" component="h1" sx={{ mb: 0 }}>
                    Send Module Review Reminders
                </Typography>

                <Typography variant="body1" color="text.secondary">
                    The sample email below will be sent to module leads with pending reviews.
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
                    Email Preview
                </Typography>
                <Box component="iframe" srcDoc={emailMessageHtml}
                    title="Email Preview"
                    sx={{
                        width: '100%',
                        height: '500px',
                        border: '1px solid',
                        borderColor: 'divider', // theme's border color
                        borderRadius: 2 // theme's border radius
                    }}
                />
            </Paper>

            <Box sx={{ textAlign: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={isSending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                    onClick={handleSendReminders}
                    disabled={isSending || recipientEmails.length === 0}
                >
                    {isSending ? 'Sending...' : `Send Reminder`}
                </Button>
            </Box>

        </Stack>
    )

};

export default EmailReminder;