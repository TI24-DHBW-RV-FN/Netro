import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter: Transporter = nodemailer.createTransport ({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.OFFICE365_EMAIL,
        pass: process.env.OFFICE365_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

//test
export const verifyEmailConnection = async(): Promise<boolean> => {
    try {
        await transporter.verify();
        console.log ("Success: SMTP Server is ready")
        return true;
    } catch (error) {
        console.error ("Error: SMTP Connection Error:", error);
        if (process.env.NODE_ENV === 'production') {
            throw new Error('SMTP connection failed - check credentials');
        }
        return false;
    }
};