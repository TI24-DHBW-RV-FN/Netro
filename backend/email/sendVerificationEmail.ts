import { generateVerificationCode } from "./generateVerificationCode.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVerificationEmail(userEmail: string): Promise<string> {
    const code = generateVerificationCode();

    await sendEmail({
        userEmail,
        verificationCode: code,
    });

    console.log("Verification email sent");
    return code;
}
