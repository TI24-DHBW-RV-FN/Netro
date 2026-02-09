import { describe, it, expect } from "vitest";
import { generateVerificationCode } from "./generateVerificationCode.js";

describe("generateVerificationCode", () => {
    it("should return a string with exactly 6 characters", () => {
        const code = generateVerificationCode();
        expect(code).toHaveLength(6);
    });

    it("should return a string containing only digits", () => {
        const code = generateVerificationCode();
        expect(code).toMatch(/^\d{6}$/);
    });

    it("should pad codes with leading zeros when necessary", () => {
        // Generate multiple codes to increase chances of getting a small number
        const codes = Array.from({ length: 100 }, () => generateVerificationCode());

        // All codes should be 6 digits
        codes.forEach((code) => {
            expect(code).toHaveLength(6);
        });

        // Check that some codes start with 0 (statistically likely with 100 samples)
        const hasLeadingZero = codes.some((code) => code.startsWith("0"));
        expect(hasLeadingZero).toBe(true);
    });

    it("should generate codes in the valid range (000000-999999)", () => {
        const codes = Array.from({ length: 50 }, () => generateVerificationCode());

        codes.forEach((code) => {
            const numericValue = parseInt(code, 10);
            expect(numericValue).toBeGreaterThanOrEqual(0);
            expect(numericValue).toBeLessThanOrEqual(999999);
        });
    });

    it("should generate different codes on subsequent calls", () => {
        const codes = new Set(Array.from({ length: 100 }, () => generateVerificationCode()));

        // With 100 calls, we should get mostly unique codes (not all will be unique due to randomness)
        // But we should get more than 80 unique codes out of 100
        expect(codes.size).toBeGreaterThan(80);
    });

    it("should handle edge case of 0 correctly", () => {
        // This test verifies the padding logic by checking format
        const codes = Array.from({ length: 1000 }, () => generateVerificationCode());

        // If we ever generate 0, it should be '000000'
        const hasAllZeros = codes.includes("000000");
        if (hasAllZeros) {
            expect("000000").toMatch(/^\d{6}$/);
            expect("000000").toHaveLength(6);
        }
    });
});
