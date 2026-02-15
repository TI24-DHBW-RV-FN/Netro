import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendEmail } from "./sendEmail.js";
import { transporter } from "./transporter.js";

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

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: mockMessageId,
            accepted: ["user@example.com"],
            rejected: [],
            pending: [],
            response: "250 OK",
        } as any);

        await sendEmail("user@example.com", "123456");

        expect(transporter.sendMail).toHaveBeenCalledTimes(1);
        expect(transporter.sendMail).toHaveBeenCalledWith({
            from: '"Netro" <noreply@netro.com>',
            to: "user@example.com",
            subject: "Welcome to Netro, Verify your email address",
            html: expect.stringContaining("Welcome to Netro!"),
        });
    });

    it("should include verification code in email HTML", async () => {
        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail("user@example.com", "987654");

        const callArgs = vi.mocked(transporter.sendMail).mock.calls[0][0];
        expect(callArgs.html).toContain("987654");
        expect(callArgs.html).toContain('<div class="codeBox">987654</div>');
    });

    it("should use environment variables for sender information", async () => {
        process.env.APP_NAME = "TestApp";
        process.env.OFFICE365_EMAIL = "test@testapp.com";

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail("user@example.com", "123456");

        expect(transporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                from: '"TestApp" <test@testapp.com>',
            }),
        );

        const callArgs = vi.mocked(transporter.sendMail).mock.calls[0][0];
        expect(callArgs.html).toContain("Welcome to TestApp!");
    });

    it("should send email to correct recipient", async () => {
        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail("specific.user@example.com", "123456");

        expect(transporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "specific.user@example.com",
            }),
        );
    });

    it("should include correct subject line", async () => {
        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail("user@example.com", "123456");

        expect(transporter.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: "Welcome to Netro, Verify your email address",
            }),
        );
    });

    it("should log success message with messageId on successful send", async () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const mockMessageId = "unique-message-id-789";

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: mockMessageId,
        } as any);

        await sendEmail("user@example.com", "123456");

        expect(consoleSpy).toHaveBeenCalledWith("Success: Email Verification sent:", mockMessageId);

        consoleSpy.mockRestore();
    });

    it("should throw error and log when email sending fails", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const mockError = new Error("SMTP connection failed");

        vi.mocked(transporter.sendMail).mockRejectedValue(mockError);

        await expect(sendEmail("user@example.com", "123456")).rejects.toThrow("Failed to send verification email");

        expect(consoleErrorSpy).toHaveBeenCalledWith("Error: Sending Verification:", mockError);

        consoleErrorSpy.mockRestore();
    });

    it("should handle transporter errors and throw custom error message", async () => {
        vi.mocked(transporter.sendMail).mockRejectedValue(new Error("Recipient address rejected"));

        await expect(sendEmail("invalid@example.com", "123456")).rejects.toThrow("Failed to send verification email");
        expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    });

    it("should generate valid HTML structure", async () => {
        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail("user@example.com", "123456");

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

            vi.mocked(transporter.sendMail).mockResolvedValue({
                messageId: "msg-123",
            } as any);

            await sendEmail("user@example.com", code);

            const callArgs = vi.mocked(transporter.sendMail).mock.calls[0][0];
            expect(callArgs.html).toContain(code);
        }
    });

    it("should not mutate input data", async () => {
        const userEmail = "user@example.com";
        const verificationCode = "123456";

        const originalEmail = userEmail;
        const originalCode = verificationCode;

        vi.mocked(transporter.sendMail).mockResolvedValue({
            messageId: "msg-123",
        } as any);

        await sendEmail(userEmail, verificationCode);

        expect(userEmail).toBe(originalEmail);
        expect(verificationCode).toBe(originalCode);
    });
});
