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
        // This tells SendGrid to treat these as separate sends
        // even if batched in one API call.

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

// export const sendEmail = async (subject, message, sendTo, sendFrom) => {
//     const transporter = nodemailer.createTransport({
//         host: "smtp-mail.outlook.com", // smtp-mail.outlook.com
//         port: 587, // This is the port for STARTTLS
//         auth: {
//             type: "OAuth2",
//             // user: process.env.EMAIL_USER,
//             // clientId: process.env.OAUTH_CLIENT_ID,
//             // clientSecret: process.env.OAUTH_CLIENT_SECRET,
//             // refreshToken: process.env.OAUTH_REFRESH_TOKEN

//             user: 'moduleproject@outlook.com',
//             clientId: '735f3b8f-1372-4258-9d7f-579c9129ea16',
//             clientSecret: 'k_i8Q~r6Ey-NKZXKxn1PCZxoIHZtaK5XyYol2bVP',
//             refreshToken: 'M.C518_BAY.0.U.-ChAectpib1U*Rvf1eXu739D*8E1KAVtazxyHEWYmYF!zyxrz!Q!Jcza3YjD9*tlB0n71kzWCSE8C*RdgTLxCLFic3Tu4EW2ljGzrIJSUqcrwh!tuU9cwcX0pwsyhdplLrKw0u3*wYfRWKsNgL5junmXJK2SsOjWxqfMyMSbhDYNwgC67Jz9t!YkKGIoHm4ijDiTZiikPyzPh8hAKZvsUGdaN8O3T3EQJ1KoQMojigYYiBfp6BcZQB9tRNCvPEnXIT0lF1VqG5zEm1Ipzj9EQ*30ag8!6dLkIkdXQkzdkt7e71!jinIh47lINJyZBpl2IH4o*2TsrC1P246cx5HjPIkJr7Db4yTqAM!DLWgnEKSx2vZLOxNO2GAvub38aP6jXtBnJzi!TVXP!iEdKoIzKGZA$'
//         },
//         secure: false, // true for 465, false for other ports
//         // tls: { no need for it
//         //     rejectUnauthorized: false // do not fail on invalid certs
//         // }
//     })

//     const options = {
//         from: `"${sendFrom}" <${process.env.EMAIL_USER}>`, // Recommended format
//         to: sendTo,
//         subject: subject,
//         html: message,
//     };

//     // Use await and try/catch here
//     try {
//         const info = await transporter.sendMail(options);
//         console.log("Email sent successfully:", info.response);
//     } catch (error) {
//         console.error("Error from Nodemailer:", error);
//         // Re-throw the error so the route handler's catch block can see it
//         throw error;
//     }

    // // send Email
    // transporter.sendMail(options, function(err, info) {
    //     if (err) {
    //         console.log(err)
    //     }
    //     else {
    //         console.log(info)
    //     }
    // })

// }