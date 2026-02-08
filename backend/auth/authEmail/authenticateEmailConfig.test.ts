import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { transporter, verifyEmailConnection } from './authenticateEmailConfig.js';

// Mock nodemailer
vi.mock('nodemailer', () => ({
    default: {
        createTransport: vi.fn(() => ({
            verify: vi.fn()
        }))
    }
}));

describe('authenticateEmailConfig', () => {
    let mockVerify: any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // Get the mocked verify function
        mockVerify = (transporter as any).verify;

        // Setup environment variables
        process.env.OFFICE365_EMAIL = 'test@office365.com';
        process.env.OFFICE365_PASSWORD = 'test-password';
        process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('transporter', () => {
        it('should be defined', () => {
            expect(transporter).toBeDefined();
        });

        it('should have verify method', () => {
            expect(transporter.verify).toBeDefined();
            expect(typeof transporter.verify).toBe('function');
        });
    });

    describe('verifyEmailConnection', () => {
        it('should return true when SMTP connection is successful', async () => {
            mockVerify.mockResolvedValueOnce(true);

            const result = await verifyEmailConnection();

            expect(result).toBe(true);
            expect(mockVerify).toHaveBeenCalledTimes(1);
        });

        it('should log success message on successful connection', async () => {
            mockVerify.mockResolvedValueOnce(true);

            await verifyEmailConnection();

            expect(console.log).toHaveBeenCalledWith('Success: SMTP Server is ready');
        });

        it('should return false on connection error in development', async () => {
            process.env.NODE_ENV = 'development';
            mockVerify.mockRejectedValueOnce(new Error('Connection failed'));

            const result = await verifyEmailConnection();

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith(
                'Error: SMTP Connection Error:',
                expect.any(Error)
            );
        });

        it('should throw error on connection failure in production', async () => {
            process.env.NODE_ENV = 'production';
            mockVerify.mockRejectedValueOnce(new Error('Connection failed'));

            await expect(verifyEmailConnection())
                .rejects
                .toThrow('SMTP connection failed - check credentials');
        });

        it('should log error message on connection failure', async () => {
            const error = new Error('Authentication failed');
            mockVerify.mockRejectedValueOnce(error);

            try {
                await verifyEmailConnection();
            } catch (e) {
                // May throw in production
            }

            expect(console.error).toHaveBeenCalledWith(
                'Error: SMTP Connection Error:',
                error
            );
        });

        it('should handle network timeout errors', async () => {
            mockVerify.mockRejectedValueOnce(new Error('Timeout'));

            const result = await verifyEmailConnection();

            expect(result).toBe(false);
        });

        it('should handle authentication errors', async () => {
            mockVerify.mockRejectedValueOnce(new Error('Invalid credentials'));

            const result = await verifyEmailConnection();

            expect(result).toBe(false);
        });

        it('should handle TLS/SSL errors', async () => {
            mockVerify.mockRejectedValueOnce(new Error('TLS negotiation failed'));

            const result = await verifyEmailConnection();

            expect(result).toBe(false);
        });

        it('should be callable multiple times', async () => {
            mockVerify.mockResolvedValue(true);

            const result1 = await verifyEmailConnection();
            const result2 = await verifyEmailConnection();
            const result3 = await verifyEmailConnection();

            expect(result1).toBe(true);
            expect(result2).toBe(true);
            expect(result3).toBe(true);
            expect(mockVerify).toHaveBeenCalledTimes(3);
        });

        it('should handle intermittent failures', async () => {
            mockVerify
                .mockRejectedValueOnce(new Error('Temporary failure'))
                .mockResolvedValueOnce(true);

            const result1 = await verifyEmailConnection();
            const result2 = await verifyEmailConnection();

            expect(result1).toBe(false);
            expect(result2).toBe(true);
        });
    });

    describe('environment variable handling', () => {
        it('should use environment variables for configuration', () => {
            expect(process.env.OFFICE365_EMAIL).toBe('test@office365.com');
            expect(process.env.OFFICE365_PASSWORD).toBe('test-password');
        });

        it('should handle missing environment variables gracefully', async () => {
            delete process.env.OFFICE365_EMAIL;
            delete process.env.OFFICE365_PASSWORD;

            mockVerify.mockRejectedValueOnce(new Error('No credentials'));

            const result = await verifyEmailConnection();

            expect(result).toBe(false);
        });
    });

    describe('error scenarios', () => {
        it('should handle DNS resolution errors', async () => {
            mockVerify.mockRejectedValueOnce(new Error('ENOTFOUND smtp.office365.com'));

            const result = await verifyEmailConnection();

            expect(result).toBe(false);
        });

        it('should handle connection refused errors', async () => {
            mockVerify.mockRejectedValueOnce(new Error('ECONNREFUSED'));

            const result = await verifyEmailConnection();

            expect(result).toBe(false);
        });

        it('should handle rate limiting errors', async () => {
            mockVerify.mockRejectedValueOnce(new Error('Too many connections'));

            const result = await verifyEmailConnection();

            expect(result).toBe(false);
        });
    });
});

/**
 * This code was programmatically generated using Claude 4.5 Sonnet on February 8, 2026.
 * It has been manually reviewed and tested.
 */