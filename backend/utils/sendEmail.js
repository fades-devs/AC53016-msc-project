import nodemailer from "nodemailer";

export const sendEmail = async (subject, message, sendTo, sendFrom) => {
    const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // smtp-mail.outlook.com
        port: 587, // This is the port for STARTTLS
        auth: {
            type: "OAuth2",
            user: "moduleproject@outlook.com",
            clientId: "735f3b8f-1372-4258-9d7f-579c9129ea16",
            clientSecret: "8Os8Q~wGEJTQzVCTiTiWLAC.mwKxRsITddRFEbLL",
            refreshToken: "M.C518_BAY.0.U.-Cl!yDcj8z6Qh!zUyp!ws4XP559lRJ8y7m1OnKRUdyvSBOOqFeJoVasof9gwJKgPlKiTdjqy5IW4WgCHpoW4AEIF8G6UhEdudFBoR9LaiFkAQ!P4*7OjLMiA0WmMxi*9SKdjLneasBJJOSvRYrdsand!T9GIlk37oxEbhV40s!ya5fNMOMc1s2IelaoE!rCOgmrLK0h3fyGr6QXeRJiYzA2JtMzXtOwmG!1yHlcy06FXbpvgV7xWMmLMATWj0YZKA2c7kMTiTHaB9f69YKLpTvYDRRmzle2HSnKzNtgljEMBt7*j8zi1SNjQDOylE3T*EC3kFY7FTA3X4EZLRWNK8SXCVqr5KWcPenYqufXR*AIV8sHC9t73Q2*ub033kMGwhtQaLsUXjc4jWEBj1p*Xc6c7tkuRfJvOykYCBzxYt!rpKhmEQ8L0qzLQp8sDcWs51zQ$$"
        },
        secure: false, // true for 465, false for other ports
        tls: {
            rejectUnauthorized: false // do not fail on invalid certs
        }
    })

    const options = {
        from: sendFrom,
        to: sendTo,
        subject: subject,
        html: message,
    };

    // Use await and try/catch here
    try {
        const info = await transporter.sendMail(options);
        console.log("Email sent successfully:", info);
    } catch (error) {
        console.error("Error from Nodemailer:", error);
        // Re-throw the error so the route handler's catch block can see it
        throw error;
    }

    // // send Email
    // transporter.sendMail(options, function(err, info) {
    //     if (err) {
    //         console.log(err)
    //     }
    //     else {
    //         console.log(info)
    //     }
    // })

}