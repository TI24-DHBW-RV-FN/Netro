//Re-export public functions
export { verifyEmailConnection } from "./authenticateEmailConfig.js";
export { checkEmailVerified } from "./authenticateEmailUserRepository.js";
export {
    sendVerificationAfterRegistration,
    verifyCode,
    resendVerificationCode,
    cleanupExpiredCodes
} from "./authenticateEmailVerificationService.js";

import { cleanupExpiredCodes } from "./authenticateEmailVerificationService.js";

setInterval(() => {
    cleanupExpiredCodes();
    console.log("Expired verification codes cleaned up");
}, 10 * 60 * 1000);