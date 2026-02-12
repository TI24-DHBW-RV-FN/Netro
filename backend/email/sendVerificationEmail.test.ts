import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendVerificationEmail } from "./sendVerificationEmail.js";
import * as sendEmailModule from "./sendEmail.js";
import * as generateCodeModule from "./generateVerificationCode.js";

vi.mock("./sendEmail", () => ({
    sendEmail: vi.fn(),
}));

vi.mock("./generateVerificationCode", () => ({
    generateVerificationCode: vi.fn(),
}));

describe("sendVerificationEmail", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should generate a verification code", async () => {
        const mockCode = "123456";
        vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue();

        await sendVerificationEmail("test@example.com");

        expect(generateCodeModule.generateVerificationCode).toHaveBeenCalledTimes(1);
    });

    it("should send email with correct user email and verification code", async () => {
        const mockCode = "123456";
        vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue();

        await sendVerificationEmail("test@example.com");

        expect(sendEmailModule.sendEmail).toHaveBeenCalledTimes(1);
        expect(sendEmailModule.sendEmail).toHaveBeenCalledWith("test@example.com", "123456");
    });

    it("should return the generated verification code", async () => {
        const mockCode = "654321";
        vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue();

        const result = await sendVerificationEmail("test@example.com");

        expect(result).toBe(mockCode);
    });

    it("should log success message after sending email", async () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const mockCode = "123456";
        vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue();

        await sendVerificationEmail("test@example.com");

        expect(consoleSpy).toHaveBeenCalledWith("Verification email sent");

        consoleSpy.mockRestore();
    });

    it("should handle different email addresses correctly", async () => {
        const mockCode = "111111";
        vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue();

        const emails = ["user1@example.com", "user2@test.com", "admin@domain.org"];

        for (const email of emails) {
            vi.clearAllMocks();
            vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(mockCode);

            await sendVerificationEmail(email);

            expect(sendEmailModule.sendEmail).toHaveBeenCalledWith(email, mockCode);
        }
    });

    it("should propagate errors from sendEmail", async () => {
        const mockCode = "123456";
        const mockError = new Error("Failed to send verification email");

        vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockRejectedValue(mockError);

        await expect(sendVerificationEmail("test@example.com")).rejects.toThrow("Failed to send verification email");
    });

    it("should call functions in correct order", async () => {
        const callOrder: string[] = [];
        const mockCode = "123456";

        vi.mocked(generateCodeModule.generateVerificationCode).mockImplementation(() => {
            callOrder.push("generateCode");
            return mockCode;
        });

        vi.mocked(sendEmailModule.sendEmail).mockImplementation(async () => {
            callOrder.push("sendEmail");
        });

        await sendVerificationEmail("test@example.com");

        expect(callOrder).toEqual(["generateCode", "sendEmail"]);
    });

    it("should generate new code for each call", async () => {
        const codes = ["111111", "222222", "333333"];
        let callCount = 0;

        vi.mocked(generateCodeModule.generateVerificationCode).mockImplementation(() => {
            return codes[callCount++];
        });

        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue();

        const result1 = await sendVerificationEmail("test@example.com");
        const result2 = await sendVerificationEmail("test@example.com");
        const result3 = await sendVerificationEmail("test@example.com");

        expect(result1).toBe("111111");
        expect(result2).toBe("222222");
        expect(result3).toBe("333333");
        expect(generateCodeModule.generateVerificationCode).toHaveBeenCalledTimes(3);
    });

    it("should not log if sendEmail fails", async () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const mockCode = "123456";
        const mockError = new Error("SMTP failed");

        vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockRejectedValue(mockError);

        await expect(sendVerificationEmail("test@example.com")).rejects.toThrow();

        expect(consoleSpy).not.toHaveBeenCalledWith("Verification email sent");

        consoleSpy.mockRestore();
    });

    it("should await sendEmail before logging and returning", async () => {
        const executionOrder: string[] = [];
        const mockCode = "123456";

        vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(mockCode);

        vi.mocked(sendEmailModule.sendEmail).mockImplementation(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            executionOrder.push("sendEmail completed");
        });

        const originalLog = console.log;
        console.log = vi.fn((...args) => {
            if (args[0] === "Verification email sent") {
                executionOrder.push("log called");
            }
            originalLog(...args);
        });

        const result = await sendVerificationEmail("test@example.com");

        expect(executionOrder).toEqual(["sendEmail completed", "log called"]);
        expect(result).toBe(mockCode);

        console.log = originalLog;
    });

    it("should handle empty or whitespace email addresses", async () => {
        const mockCode = "123456";
        vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(mockCode);
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue();

        await sendVerificationEmail("   ");

        expect(sendEmailModule.sendEmail).toHaveBeenCalledWith("   ", mockCode);
    });

    it("should handle verification codes of different formats", async () => {
        const testCodes = ["000000", "999999", "123ABC", "aBcDeF"];
        vi.mocked(sendEmailModule.sendEmail).mockResolvedValue();

        for (const code of testCodes) {
            vi.clearAllMocks();
            vi.mocked(generateCodeModule.generateVerificationCode).mockReturnValue(code);

            const result = await sendVerificationEmail("user@example.com");

            expect(result).toBe(code);
            expect(sendEmailModule.sendEmail).toHaveBeenCalledWith("user@example.com", code);
        }
    });

    it("should not catch errors from generateVerificationCode", async () => {
        const mockError = new Error("Code generation failed");
        vi.mocked(generateCodeModule.generateVerificationCode).mockImplementation(() => {
            throw mockError;
        });

        await expect(sendVerificationEmail("test@example.com")).rejects.toThrow("Code generation failed");

        expect(sendEmailModule.sendEmail).not.toHaveBeenCalled();
    });
});
