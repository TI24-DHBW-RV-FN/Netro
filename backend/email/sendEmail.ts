import { transporter } from "./transporter.js";

export async function sendEmail(userEmail: string, verificationCode: string): Promise<void> {
    const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.OFFICE365_EMAIL}>`,
        to: userEmail,
        subject: "Welcome to Netro, Verify your email address",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Welcome to ${process.env.APP_NAME}!</h2>
                    <p>Pleasy verify</p>
                    <div class="codeBox">${verificationCode}</div>
                </div>
            </body>
            </html>
        `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Success: Email Verification sent:", info.messageId);
    } catch (error) {
        console.error("Error: Sending Verification:", error);
        throw new Error("Failed to send verification email");
    }
}
