import { generateVerificationCode } from "./generateVerificationCode.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVerificationEmail(userEmail: string): Promise<string> {
    const verificationCode = generateVerificationCode();

    await sendEmail(userEmail, verificationCode);

    console.log("Verification email sent");
    return verificationCode;
}
