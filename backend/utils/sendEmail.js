import nodemailer from "nodemailer";

// email.js
import sgMail from '@sendgrid/mail';

// Set the API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


export const sendEmail = async (subject, message, sendTo, senderDisplayName) => {

    // Ensure sendTo is always an array
    const recipients = Array.isArray(sendTo) ? sendTo : [sendTo];
    // Create an array of message objects, one for each recipient
    const messages = recipients.map(recipientEmail => ({
        to: recipientEmail,
        from: {
            email: process.env.SENDER_EMAIL,
            name: senderDisplayName
        },
        subject: subject,
        html: message,
        // Tells SendGrid to treat these as separate sends even if one API call
    }));
    try {
        // Use send() with an array of messages for bulk individual sending
        await sgMail.send(messages);
        console.log('Email sent successfully via SendGrid');
    } catch (error) {
        console.error("Error from SendGrid:", error);
        // If there's an error, it might have more details in the response body
        if (error.response) {
            console.error(error.response.body)
        }
        throw error;
    }
};