import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    storeVerificationCode,
    sendVerificationAfterRegistration,
    verifyCode,
    resendVerificationCode,
    cleanupExpiredCodes
} from './authenticateEmailVerificationService.js';

// IMPORTANT: Must use vi.hoisted to avoid hoisting issues
const { mockGenerateCode, mockCanResendCode, mockSendEmail, mockMarkVerified } = vi.hoisted(() => {
    return {
        mockGenerateCode: vi.fn(),
        mockCanResendCode: vi.fn(),
        mockSendEmail: vi.fn(),
        mockMarkVerified: vi.fn()
    };
});

// Mock all dependencies
vi.mock('./authenticateEmailCodeGenerator.js', () => ({
    generateVerificationCode: mockGenerateCode
}));

vi.mock('./authenticateEmailRateLimiter.js', () => ({
    canResendCode: mockCanResendCode
}));

vi.mock('./authenticateEmailService.js', () => ({
    sendVerificationEmail: mockSendEmail
}));

vi.mock('./authenticateEmailUserRepository.js', () => ({
    markEmailAsVerified: mockMarkVerified
}));

describe('authenticateEmailVerificationService', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // Reset modules to clear the Map
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('storeVerificationCode', () => {
        it('should store code with email and expiry time', () => {
            const email = 'test@example.com';
            const code = '123456';

            expect(() => storeVerificationCode(email, code)).not.toThrow();
        });
    });

    describe('sendVerificationAfterRegistration', () => {
        it('should generate code and send verification email', async () => {
            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            await sendVerificationAfterRegistration('user@example.com');

            expect(mockGenerateCode).toHaveBeenCalledTimes(1);
            expect(mockSendEmail).toHaveBeenCalledWith({
                userEmail: 'user@example.com',
                verificationCode: '123456'
            });
        });

        it('should log success message', async () => {
            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            await sendVerificationAfterRegistration('user@example.com');

            expect(console.log).toHaveBeenCalledWith('Verification email sent');
        });

        it('should handle different email addresses', async () => {
            mockGenerateCode.mockReturnValue('654321');
            mockSendEmail.mockResolvedValue(undefined);

            const emails = ['user1@test.com', 'user2@test.com', 'user3@test.com'];

            for (const email of emails) {
                await sendVerificationAfterRegistration(email);

                expect(mockSendEmail).toHaveBeenCalledWith({
                    userEmail: email,
                    verificationCode: '654321'
                });
            }
        });

        it('should propagate errors from email service', async () => {
            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockRejectedValue(new Error('Email failed'));

            await expect(sendVerificationAfterRegistration('user@example.com'))
                .rejects
                .toThrow('Email failed');
        });
    });

    describe('verifyCode', () => {
        beforeEach(() => {
            mockMarkVerified.mockResolvedValue(true);
        });

        it('should return error when no code is stored', async () => {
            const result = await verifyCode('unknown@example.com', '123456');

            expect(result).toEqual({
                success: false,
                message: 'No verification code found for this email'
            });
        });

        it('should return error when code has expired', async () => {
            vi.useFakeTimers();

            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            await sendVerificationAfterRegistration('test@example.com');

            // Fast-forward past expiry (5 minutes + 1 second)
            vi.advanceTimersByTime(5 * 60 * 1000 + 1000);

            const result = await verifyCode('test@example.com', '123456');

            expect(result).toEqual({
                success: false,
                message: 'Verification code has expired'
            });

            vi.useRealTimers();
        });

        it('should return error for invalid code', async () => {
            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            await sendVerificationAfterRegistration('test@example.com');

            const result = await verifyCode('test@example.com', 'wrong-code');

            expect(result).toEqual({
                success: false,
                message: 'Invalid verification code'
            });
        });

        it('should track failed attempts', async () => {
            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            await sendVerificationAfterRegistration('test@example.com');

            await verifyCode('test@example.com', 'wrong1');
            await verifyCode('test@example.com', 'wrong2');
            await verifyCode('test@example.com', 'wrong3');

            // After 3 failed attempts, should get too many attempts error
            const tooManyResult = await verifyCode('test@example.com', '123456');

            expect(tooManyResult).toEqual({
                success: false,
                message: 'Too many failed attempts. Please request a new code'
            });
        });

        it('should successfully verify correct code', async () => {
            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            await sendVerificationAfterRegistration('test@example.com');

            const result = await verifyCode('test@example.com', '123456');

            expect(result).toEqual({
                success: true,
                message: 'Email verified successfully'
            });
            expect(mockMarkVerified).toHaveBeenCalledWith('test@example.com');
        });

        it('should delete verification code after successful verification', async () => {
            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            await sendVerificationAfterRegistration('test@example.com');
            await verifyCode('test@example.com', '123456');

            // Try to verify again with same code
            const result = await verifyCode('test@example.com', '123456');

            expect(result).toEqual({
                success: false,
                message: 'No verification code found for this email'
            });
        });

        it('should handle database update failure', async () => {
            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);
            mockMarkVerified.mockResolvedValue(false);

            await sendVerificationAfterRegistration('test@example.com');

            const result = await verifyCode('test@example.com', '123456');

            expect(result).toEqual({
                success: false,
                message: 'Verification succeeded but database update failed'
            });
        });

        it('should allow verification before expiry', async () => {
            vi.useFakeTimers();

            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            await sendVerificationAfterRegistration('test@example.com');

            // Fast-forward to just before expiry (4 minutes 59 seconds)
            vi.advanceTimersByTime(4 * 60 * 1000 + 59 * 1000);

            const result = await verifyCode('test@example.com', '123456');

            expect(result.success).toBe(true);

            vi.useRealTimers();
        });
    });

    describe('resendVerificationCode', () => {
        it('should generate new code and send email when allowed', async () => {
            mockCanResendCode.mockReturnValue(true);
            mockGenerateCode.mockReturnValue('654321');
            mockSendEmail.mockResolvedValue(undefined);

            await resendVerificationCode('user@example.com');

            expect(mockCanResendCode).toHaveBeenCalledWith('user@example.com');
            expect(mockGenerateCode).toHaveBeenCalled();
            expect(mockSendEmail).toHaveBeenCalledWith({
                userEmail: 'user@example.com',
                verificationCode: '654321'
            });
        });

        it('should throw error when rate limit is exceeded', async () => {
            mockCanResendCode.mockReturnValue(false);

            await expect(resendVerificationCode('user@example.com'))
                .rejects
                .toThrow('Too many resend attempts. Please try again later.');
        });

        it('should not send email when rate limited', async () => {
            mockCanResendCode.mockReturnValue(false);

            try {
                await resendVerificationCode('user@example.com');
            } catch (e) {
                // Expected
            }

            expect(mockSendEmail).not.toHaveBeenCalled();
        });

        it('should replace old code with new code', async () => {
            mockCanResendCode.mockReturnValue(true);
            mockGenerateCode
                .mockReturnValueOnce('111111')
                .mockReturnValueOnce('222222');
            mockSendEmail.mockResolvedValue(undefined);

            await sendVerificationAfterRegistration('test@example.com');
            await resendVerificationCode('test@example.com');

            expect(mockSendEmail).toHaveBeenCalledTimes(2);
            expect(mockSendEmail).toHaveBeenLastCalledWith({
                userEmail: 'test@example.com',
                verificationCode: '222222'
            });
        });
    });

    describe('cleanupExpiredCodes', () => {
        it('should remove expired codes', async () => {
            vi.useFakeTimers();

            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            // Create some verification codes
            await sendVerificationAfterRegistration('user1@example.com');
            await sendVerificationAfterRegistration('user2@example.com');

            // Fast-forward past expiry
            vi.advanceTimersByTime(6 * 60 * 1000);

            cleanupExpiredCodes();

            // Codes should be deleted
            const result1 = await verifyCode('user1@example.com', '123456');
            const result2 = await verifyCode('user2@example.com', '123456');

            expect(result1.success).toBe(false);
            expect(result2.success).toBe(false);

            vi.useRealTimers();
        });

        it('should keep non-expired codes', async () => {
            vi.useFakeTimers();

            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            await sendVerificationAfterRegistration('test@example.com');

            // Fast-forward but not past expiry (3 minutes)
            vi.advanceTimersByTime(3 * 60 * 1000);

            cleanupExpiredCodes();

            // Code should still be valid
            const result = await verifyCode('test@example.com', '123456');
            expect(result.success).toBe(true);

            vi.useRealTimers();
        });

        it('should handle empty storage', () => {
            expect(() => cleanupExpiredCodes()).not.toThrow();
        });

        it('should clean up multiple expired codes at different times', async () => {
            vi.useFakeTimers();

            mockGenerateCode.mockReturnValue('123456');
            mockSendEmail.mockResolvedValue(undefined);

            // Create first code
            await sendVerificationAfterRegistration('user1@example.com');

            // Advance 2 minutes
            vi.advanceTimersByTime(2 * 60 * 1000);

            // Create second code (will expire 2 min later than first)
            await sendVerificationAfterRegistration('user2@example.com');

            // Advance 4 more minutes (total 6 min from first, 4 min from second)
            vi.advanceTimersByTime(4 * 60 * 1000);

            cleanupExpiredCodes();

            // First code should be expired (6 min > 5 min)
            const result1 = await verifyCode('user1@example.com', '123456');
            expect(result1.success).toBe(false);

            // Second code should still be valid (4 min < 5 min)
            const result2 = await verifyCode('user2@example.com', '123456');
            expect(result2.success).toBe(true);

            vi.useRealTimers();
        });
    });
});

/**
 * This code was programmatically generated using Claude 4.5 Sonnet on February 8, 2026.
 * It has been manually reviewed and tested.
 */