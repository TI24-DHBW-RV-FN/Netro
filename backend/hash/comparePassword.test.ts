import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcrypt";
import { comparePassword } from "./comparePassword.js";

describe("comparePassword", () => {
    let testHash: string;
    const testPassword = "correctPassword123";

    beforeAll(async () => {
        // Generate a hash once before all tests
        testHash = await bcrypt.hash(testPassword, 12);
    });

    it("should return true for matching password and hash", async () => {
        const result = await comparePassword(testPassword, testHash);
        expect(result).toBe(true);
    });

    it("should return false for non-matching password and hash", async () => {
        const wrongPassword = "wrongPassword123";
        const result = await comparePassword(wrongPassword, testHash);
        expect(result).toBe(false);
    });

    it("should be case-sensitive", async () => {
        const result = await comparePassword("CORRECTPASSWORD123", testHash);
        expect(result).toBe(false);
    });

    it("should return false for empty password", async () => {
        const result = await comparePassword("", testHash);
        expect(result).toBe(false);
    });
});
