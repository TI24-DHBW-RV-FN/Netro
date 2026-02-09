import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendEmail } from "./sendEmail.js";
import { transporter } from "./transporter.js";
import type { verificationEmailData } from "./emailTypes.js";

vi.mock("./transporter", () => ({
    transporter: {
        sendMail: vi.fn(),
    },
}));

describe("sendEmail", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = {
            ...originalEnv,
            APP_NAME: "Netro",
            OFFICE365_EMAIL: "noreply@netro.com",
        };
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    it("should successfully send verification email with correct options", async () => {
        const mockMessageId = "message-id-123";
        const emailData: verificationEmailData = {
            userEmail: "user@example.com",
            verificationCode: "123456",
        };

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: mockMessageId,
            accepted: ["user@example.com"],
            rejected: [],
            pending: [],
            response: "250 OK",
        } as any);

        await sendEmail(emailData);

        expect(transporter.sendMail).toHaveBeenCalledTimes(1);
        expect(transporter.sendMail).toHaveBeenCalledWith({
            from: '"Netro" <noreply@netro.com>',
            to: "user@example.com",
            subject: "Welcome to Netro, Verify your email address",
            html: expect.stringContaining("Welcome to Netro!"),
        });
    });

    it("should include verification code in email HTML", async () => {
        const emailData: verificationEmailData = {
            userEmail: "user@example.com",
            verificationCode: "987654",
        };

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail(emailData);

        const callArgs = vi.mocked(transporter.sendMail).mock.calls[0][0];
        expect(callArgs.html).toContain("987654");
        expect(callArgs.html).toContain('<div class="codeBox">987654</div>');
    });

    it("should use environment variables for sender information", async () => {
        process.env.APP_NAME = "TestApp";
        process.env.OFFICE365_EMAIL = "test@testapp.com";

        const emailData: verificationEmailData = {
            userEmail: "user@example.com",
            verificationCode: "123456",
        };

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail(emailData);

        expect(transporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                from: '"TestApp" <test@testapp.com>',
            }),
        );

        const callArgs = vi.mocked(transporter.sendMail).mock.calls[0][0];
        expect(callArgs.html).toContain("Welcome to TestApp!");
    });

    it("should send email to correct recipient", async () => {
        const emailData: verificationEmailData = {
            userEmail: "specific.user@example.com",
            verificationCode: "123456",
        };

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail(emailData);

        expect(transporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "specific.user@example.com",
            }),
        );
    });

    it("should include correct subject line", async () => {
        const emailData: verificationEmailData = {
            userEmail: "user@example.com",
            verificationCode: "123456",
        };

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail(emailData);

        expect(transporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: "Welcome to Netro, Verify your email address",
            }),
        );
    });

    it("should log success message with messageId on successful send", async () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const mockMessageId = "unique-message-id-789";
        const emailData: verificationEmailData = {
            userEmail: "user@example.com",
            verificationCode: "123456",
        };

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: mockMessageId,
        } as any);

        await sendEmail(emailData);

        expect(consoleSpy).toHaveBeenCalledWith("Success: Email Verification sent:", mockMessageId);

        consoleSpy.mockRestore();
    });

    it("should throw error and log when email sending fails", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const mockError = new Error("SMTP connection failed");
        const emailData: verificationEmailData = {
            userEmail: "user@example.com",
            verificationCode: "123456",
        };

        vi.mocked(transporter.sendMail).mockRejectedValue(mockError);

        await expect(sendEmail(emailData)).rejects.toThrow("Failed to send verification email");

        expect(consoleErrorSpy).toHaveBeenCalledWith("Error: Sending Verification:", mockError);

        consoleErrorSpy.mockRestore();
    });

    it("should handle transporter errors and throw custom error message", async () => {
        const emailData: verificationEmailData = {
            userEmail: "invalid@example.com",
            verificationCode: "123456",
        };

        vi.mocked(transporter.sendMail).mockRejectedValue(new Error("Recipient address rejected"));

        await expect(sendEmail(emailData)).rejects.toThrow("Failed to send verification email");
        expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    });

    it("should generate valid HTML structure", async () => {
        const emailData: verificationEmailData = {
            userEmail: "user@example.com",
            verificationCode: "123456",
        };

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail(emailData);

        const callArgs = vi.mocked(transporter.sendMail).mock.calls[0][0];
        const html = callArgs.html;

        expect(html).toContain("<!DOCTYPE html>");
        expect(html).toContain("<html>");
        expect(html).toContain("<head>");
        expect(html).toContain("<body>");
        expect(html).toContain("</html>");
        expect(html).toContain("Pleasy verify");
    });

    it("should handle different verification code formats", async () => {
        const testCodes = ["000000", "999999", "123ABC", "aBcDeF"];

        for (const code of testCodes) {
            vi.clearAllMocks();

            const emailData: verificationEmailData = {
                userEmail: "user@example.com",
                verificationCode: code,
            };

            vi.mocked(transporter.sendMail).mockResolvedValue({
                messageId: "msg-123",
            } as any);

            await sendEmail(emailData);

            const callArgs = vi.mocked(transporter.sendMail).mock.calls[0][0];
            expect(callArgs.html).toContain(code);
        }
    });

    it("should not mutate input data", async () => {
        const emailData: verificationEmailData = {
            userEmail: "user@example.com",
            verificationCode: "123456",
        };

        const originalEmail = emailData.userEmail;
        const originalCode = emailData.verificationCode;

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail(emailData);

        expect(emailData.userEmail).toBe(originalEmail);
        expect(emailData.verificationCode).toBe(originalCode);
    });
});
