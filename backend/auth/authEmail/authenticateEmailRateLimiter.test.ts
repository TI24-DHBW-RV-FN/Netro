import { describe, it, expect, beforeEach, vi } from 'vitest';
import { canResendCode, clearRateLimitData } from './authenticateEmailRateLimiter.js';

describe('authenticateEmailRateLimiter', () => {
    beforeEach(() => {
        // Clear the rate limit data before each test
        clearRateLimitData();
    });

    describe('canResendCode', () => {
        it('should allow first resend attempt', () => {
            const result = canResendCode('test@example.com');
            expect(result).toBe(true);
        });

        it('should allow up to 3 resend attempts', () => {
            const email = 'test@example.com';

            expect(canResendCode(email)).toBe(true);  // 1st attempt
            expect(canResendCode(email)).toBe(true);  // 2nd attempt
            expect(canResendCode(email)).toBe(true);  // 3rd attempt
        });

        it('should block resend attempts after limit is reached', () => {
            const email = 'test@example.com';

            canResendCode(email);  // 1st
            canResendCode(email);  // 2nd
            canResendCode(email);  // 3rd

            const result = canResendCode(email);  // 4th - should fail
            expect(result).toBe(false);
        });

        it('should track attempts separately for different emails', () => {
            const email1 = 'user1@example.com';
            const email2 = 'user2@example.com';

            canResendCode(email1);
            canResendCode(email1);
            canResendCode(email1);

            // email1 should be blocked
            expect(canResendCode(email1)).toBe(false);

            // email2 should still be allowed
            expect(canResendCode(email2)).toBe(true);
        });

        it('should reset attempts after timeout period', () => {
            vi.useFakeTimers();
            const email = 'test@example.com';

            // Use up all attempts
            canResendCode(email);
            canResendCode(email);
            canResendCode(email);

            expect(canResendCode(email)).toBe(false);

            // Fast-forward time by 1 hour + 1 second
            vi.advanceTimersByTime(3600000 + 1000);

            // Should be allowed again
            expect(canResendCode(email)).toBe(true);

            vi.useRealTimers();
        });

        it('should handle multiple emails with different timeout periods', () => {
            vi.useFakeTimers();

            const email1 = 'early@example.com';
            const email2 = 'late@example.com';

            // Email1 uses attempts
            canResendCode(email1);
            canResendCode(email1);
            canResendCode(email1);

            // Fast-forward 30 minutes
            vi.advanceTimersByTime(1800000);

            // Email2 uses attempts
            canResendCode(email2);
            canResendCode(email2);
            canResendCode(email2);

            // Email1 should still be blocked
            expect(canResendCode(email1)).toBe(false);

            // Fast-forward another 31 minutes (total 61 minutes)
            vi.advanceTimersByTime(1860000);

            // Email1 should be reset (>60 min passed)
            expect(canResendCode(email1)).toBe(true);

            // Email2 should still be blocked (only 31 min passed)
            expect(canResendCode(email2)).toBe(false);

            vi.useRealTimers();
        });

        it('should handle edge case of exactly 1 hour timeout', () => {
            vi.useFakeTimers();
            const email = 'test@example.com';

            canResendCode(email);
            canResendCode(email);
            canResendCode(email);

            expect(canResendCode(email)).toBe(false);

            // Exactly 1 hour
            vi.advanceTimersByTime(3600000);

            // Should still be blocked (needs to be > resetAt)
            expect(canResendCode(email)).toBe(false);

            // 1 millisecond more
            vi.advanceTimersByTime(1);

            // Now should be allowed
            expect(canResendCode(email)).toBe(true);

            vi.useRealTimers();
        });
    });
});

/**
 * This code was programmatically generated using Claude 4.5 Sonnet on February 8, 2026.
 * It has been manually reviewed and tested.
 */