const resendAttempts = new Map<string, { count: number; resetAt: number }>();
const RESEND_LIMIT = 3;
const RESET_TIMEOUT = 3600000; // 1 hour

export const canResendCode = (email: string): boolean => {
    const now = Date.now();
    const attempt = resendAttempts.get(email);

    // Reset if timeout has passed
    if (attempt && now > attempt.resetAt) {
        resendAttempts.delete(email);
    }

    const currentAttempt = resendAttempts.get(email);
    const count = currentAttempt?.count || 0;

    // Increment count and preserve resetAt from first attempt
    const newCount = count + 1;
    resendAttempts.set(email, {
        count: newCount,
        resetAt: currentAttempt?.resetAt || (now + RESET_TIMEOUT)
    });

    // Block if we've now exceeded the limit
    if (newCount > RESEND_LIMIT) {
        return false;
    }

    return true;
};

// For testing purposes - clear all rate limit data
export const clearRateLimitData = (): void => {
    resendAttempts.clear();
};