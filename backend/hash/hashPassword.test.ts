import { describe, it, expect } from "vitest";
import bcrypt from "bcrypt";
import { hashPassword } from "./hashPassword.js";

describe("hashPassword", () => {
    it("should return a hashed password", async () => {
        const password = "mySecurePassword123";
        const hash = await hashPassword(password);

        expect(hash).toBeDefined();
        expect(hash).not.toBe(password);
        expect(typeof hash).toBe("string");
        expect(hash.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for the same password", async () => {
        const password = "samePassword";
        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);

        // Hashes should be different due to salt
        expect(hash1).not.toBe(hash2);

        // But both should be valid bcrypt hashes that match the original password
        expect(await bcrypt.compare(password, hash1)).toBe(true);
        expect(await bcrypt.compare(password, hash2)).toBe(true);
    });

    it("should use salt rounds of 12", async () => {
        const password = "testPassword";
        const hash = await hashPassword(password);

        // Bcrypt hashes start with $2b$ or $2a$ followed by the cost factor
        // For 12 rounds, it should be $2b$12$ or $2a$12$
        expect(hash).toMatch(/^\$2[ab]\$12\$/);
    });
});
