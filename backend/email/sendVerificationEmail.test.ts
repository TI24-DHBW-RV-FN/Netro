import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendVerificationEmail } from "./sendVerificationEmail.js";
import * as generateVerificationCodeModule from "./generateVerificationCode.js";
import * as sendEmailModule from "./sendEmail.js";

vi.mock("./generateVerificationCode");
vi.mock("./sendEmail");

describe("sendVerificationEmail", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should generate a verification code", async () => {
        const mockCode = "123456";
        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue(undefined);

        await sendVerificationEmail("user@example.com");

        expect(generateVerificationCodeModule.generateVerificationCode).toHaveBeenCalledTimes(1);
    });

    it("should send email with correct user email and verification code", async () => {
        const mockCode = "123456";
        const userEmail = "test@example.com";

        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue(undefined);

        await sendVerificationEmail(userEmail);

        expect(sendEmailModule.sendEmail).toHaveBeenCalledTimes(1);
        expect(sendEmailModule.sendEmail).toHaveBeenCalledWith({
            userEmail: "test@example.com",
            verificationCode: "123456",
        });
    });

    it("should return the generated verification code", async () => {
        const mockCode = "987654";
        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue(undefined);

        const result = await sendVerificationEmail("user@example.com");

        expect(result).toBe("987654");
    });

    it("should log success message after sending email", async () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const mockCode = "123456";

        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue(undefined);

        await sendVerificationEmail("user@example.com");

        expect(consoleSpy).toHaveBeenCalledWith("Verification email sent");
        consoleSpy.mockRestore();
    });

    it("should handle different email addresses correctly", async () => {
        const mockCode = "111111";
        const testEmails = ["user1@example.com", "test.user@domain.co.uk", "admin+test@company.org"];

        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue(undefined);

        for (const email of testEmails) {
            vi.clearAllMocks();
            await sendVerificationEmail(email);

            expect(sendEmailModule.sendEmail).toHaveBeenCalledWith({
                userEmail: email,
                verificationCode: mockCode,
            });
        }
    });

    it("should propagate errors from sendEmail", async () => {
        const mockCode = "123456";
        const mockError = new Error("Failed to send verification email");

        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockRejectedValue(mockError);

        await expect(sendVerificationEmail("user@example.com")).rejects.toThrow("Failed to send verification email");
    });

    it("should call functions in correct order", async () => {
        const mockCode = "123456";
        const callOrder: string[] = [];

        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockImplementation(() => {
            callOrder.push("generateCode");
            return mockCode;
        });

        vi.mocked(sendEmailModule.sendEmail).mockImplementation(async () => {
            callOrder.push("sendEmail");
        });

        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {
            callOrder.push("log");
        });

        await sendVerificationEmail("user@example.com");

        expect(callOrder).toEqual(["generateCode", "sendEmail", "log"]);
        consoleSpy.mockRestore();
    });

    it("should generate new code for each call", async () => {
        const codes = ["111111", "222222", "333333"];
        let callCount = 0;

        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockImplementation(() => {
            return codes[callCount++];
        });

        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue(undefined);

        const result1 = await sendVerificationEmail("user1@example.com");
        const result2 = await sendVerificationEmail("user2@example.com");
        const result3 = await sendVerificationEmail("user3@example.com");

        expect(result1).toBe("111111");
        expect(result2).toBe("222222");
        expect(result3).toBe("333333");
        expect(generateVerificationCodeModule.generateVerificationCode).toHaveBeenCalledTimes(3);
    });

    it("should not log if sendEmail fails", async () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const mockCode = "123456";

        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockRejectedValue(new Error("Email failed"));

        await expect(sendVerificationEmail("user@example.com")).rejects.toThrow();

        expect(consoleSpy).not.toHaveBeenCalledWith("Verification email sent");
        consoleSpy.mockRestore();
    });

    it("should await sendEmail before logging and returning", async () => {
        const mockCode = "123456";
        let emailSent = false;

        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockImplementation(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            emailSent = true;
        });

        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {
            expect(emailSent).toBe(true);
        });

        const result = await sendVerificationEmail("user@example.com");

        expect(emailSent).toBe(true);
        expect(result).toBe(mockCode);
        consoleSpy.mockRestore();
    });

    it("should handle empty or whitespace email addresses", async () => {
        const mockCode = "123456";
        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue(undefined);

        await sendVerificationEmail("   ");

        expect(sendEmailModule.sendEmail).toHaveBeenCalledWith({
            userEmail: "   ",
            verificationCode: mockCode,
        });
    });

    it("should handle verification codes of different formats", async () => {
        const testCodes = ["000000", "999999", "123ABC", "ABCDEF"];
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue(undefined);

        for (const code of testCodes) {
            vi.clearAllMocks();
            vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockReturnValue(code);

            const result = await sendVerificationEmail("user@example.com");

            expect(result).toBe(code);
            expect(sendEmailModule.sendEmail).toHaveBeenCalledWith({
                userEmail: "user@example.com",
                verificationCode: code,
            });
        }
    });

    it("should not catch errors from generateVerificationCode", async () => {
        const mockError = new Error("Code generation failed");
        vi.mocked(generateVerificationCodeModule.generateVerificationCode).mockImplementation(() => {
            throw mockError;
        });

        await expect(sendVerificationEmail("user@example.com")).rejects.toThrow("Code generation failed");

        expect(sendEmailModule.sendEmail).not.toHaveBeenCalled();
    });
});
