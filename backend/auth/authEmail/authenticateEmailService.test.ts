import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendVerificationEmail } from './authenticateEmailService.js';
import type { verificationEmailData } from './authenticateEmailTypes.js';

// IMPORTANT: Must use vi.hoisted to avoid hoisting issues
const { mockSendMail } = vi.hoisted(() => {
    return {
        mockSendMail: vi.fn()
    };
});

// Mock the entire module
vi.mock('./authenticateEmailConfig.js', () => ({
    transporter: {
        sendMail: mockSendMail
    }
}));

describe('authenticateEmailService', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // Setup environment variables
        process.env.APP_NAME = 'Netro';
        process.env.OFFICE365_EMAIL = 'noreply@netro.com';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('sendVerificationEmail', () => {
        const validEmailData: verificationEmailData = {
            userEmail: 'user@example.com',
            verificationCode: '123456'
        };

        it('should send email with correct parameters', async () => {
            mockSendMail.mockResolvedValueOnce({
                messageId: 'test-message-id'
            });

            await sendVerificationEmail(validEmailData);

            expect(mockSendMail).toHaveBeenCalledTimes(1);
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: '"Netro" <noreply@netro.com>',
                    to: 'user@example.com',
                    subject: 'Welcome to Netro, Verify your email address',
                    html: expect.stringContaining('123456')
                })
            );
        });

        it('should include verification code in email HTML', async () => {
            mockSendMail.mockResolvedValueOnce({
                messageId: 'test-message-id'
            });

            await sendVerificationEmail(validEmailData);

            const callArgs = mockSendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('123456');
            expect(callArgs.html).toContain('Welcome to Netro!');
        });

        it('should log success message with message ID', async () => {
            const messageId = 'unique-message-id-123';
            mockSendMail.mockResolvedValueOnce({
                messageId
            });

            await sendVerificationEmail(validEmailData);

            expect(console.log).toHaveBeenCalledWith(
                'Success: Email Verification sent:',
                messageId
            );
        });

        it('should handle different verification codes', async () => {
            mockSendMail.mockResolvedValue({
                messageId: 'test-id'
            });

            const testCodes = ['000000', '999999', '123456', '654321'];

            for (const code of testCodes) {
                await sendVerificationEmail({
                    userEmail: 'test@example.com',
                    verificationCode: code
                });

                const lastCall = mockSendMail.mock.calls[
                mockSendMail.mock.calls.length - 1
                    ][0];
                expect(lastCall.html).toContain(code);
            }
        });

        it('should handle different email addresses', async () => {
            mockSendMail.mockResolvedValue({
                messageId: 'test-id'
            });

            const testEmails = [
                'simple@example.com',
                'user.name@example.com',
                'user+tag@example.co.uk',
                'test.email+tag@subdomain.example.com'
            ];

            for (const email of testEmails) {
                await sendVerificationEmail({
                    userEmail: email,
                    verificationCode: '123456'
                });

                const lastCall = mockSendMail.mock.calls[
                mockSendMail.mock.calls.length - 1
                    ][0];
                expect(lastCall.to).toBe(email);
            }
        });

        it('should throw error when email sending fails', async () => {
            const error = new Error('SMTP connection failed');
            mockSendMail.mockRejectedValueOnce(error);

            await expect(sendVerificationEmail(validEmailData))
                .rejects
                .toThrow('Failed to send verification email');
        });

        it('should log error when email sending fails', async () => {
            const error = new Error('SMTP error');
            mockSendMail.mockRejectedValueOnce(error);

            try {
                await sendVerificationEmail(validEmailData);
            } catch (e) {
                // Expected to throw
            }

            expect(console.error).toHaveBeenCalledWith(
                'Error: Sending Verification:',
                error
            );
        });

        it('should format email with correct structure', async () => {
            mockSendMail.mockResolvedValueOnce({
                messageId: 'test-id'
            });

            await sendVerificationEmail(validEmailData);

            const mailOptions = mockSendMail.mock.calls[0][0];

            expect(mailOptions.html).toContain('<!DOCTYPE html>');
            expect(mailOptions.html).toContain('<html>');
            expect(mailOptions.html).toContain('</html>');
            expect(mailOptions.html).toContain('Pleasy verify');
        });

        it('should use environment variables for sender information', async () => {
            process.env.APP_NAME = 'TestApp';
            process.env.OFFICE365_EMAIL = 'test@testapp.com';

            mockSendMail.mockResolvedValueOnce({
                messageId: 'test-id'
            });

            await sendVerificationEmail(validEmailData);

            const mailOptions = mockSendMail.mock.calls[0][0];
            expect(mailOptions.from).toBe('"TestApp" <test@testapp.com>');
            expect(mailOptions.html).toContain('Welcome to TestApp!');
        });

        it('should handle network timeout errors', async () => {
            mockSendMail.mockRejectedValueOnce(
                new Error('Connection timeout')
            );

            await expect(sendVerificationEmail(validEmailData))
                .rejects
                .toThrow('Failed to send verification email');
        });

        it('should handle invalid recipient errors', async () => {
            mockSendMail.mockRejectedValueOnce(
                new Error('Invalid recipient')
            );

            await expect(sendVerificationEmail({
                userEmail: 'invalid-email',
                verificationCode: '123456'
            })).rejects.toThrow('Failed to send verification email');
        });
    });
});

/**
 * This code was programmatically generated using Claude 4.5 Sonnet on February 8, 2026.
 * It has been manually reviewed and tested.
 */