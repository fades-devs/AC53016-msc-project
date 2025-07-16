import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Paper, Button, CircularProgress, List, ListItem, ListItemText, Collapse } from '@mui/material';
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

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    
    if (error) {
        return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;
    }

    return (

        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>

            <Typography variant="h4" gutterBottom>
                Send Module Review Reminders
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Recipient List ({recipientEmails.length} total)
                </Typography>
                {recipientEmails.length > 0 ? (
                    <>
                        <List dense>
                            {recipientEmails.slice(0, 5).map((email, index) => (
                                <ListItem key={index} disablePadding><ListItemText primary={email} /></ListItem>
                            ))}
                        </List>
                        <Collapse in={showAllEmails}>
                            <List dense>
                                {recipientEmails.slice(5).map((email, index) => (
                                    <ListItem key={index + 5} disablePadding><ListItemText primary={email} /></ListItem>
                                ))}
                            </List>
                        </Collapse>
                        {recipientEmails.length > 5 && (
                            <Button size="small" onClick={() => setShowAllEmails(!showAllEmails)} sx={{ mt: 1 }}>
                                {showAllEmails ? 'Show Less' : `Show ${recipientEmails.length - 5} More...`}
                            </Button>
                        )}
                    </>
                ) : (
                    <Typography>No recipients pending reminders.</Typography>
                )}
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Email Preview
                </Typography>
                <Box component="iframe" srcDoc={emailMessageHtml}
                    sx={{
                        width: '100%',
                        height: '500px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
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

        </Container>
    )

};

export default EmailReminder;