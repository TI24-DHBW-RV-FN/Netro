import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { generateToken } from "./generateToken.js";

describe("generateToken", () => {
    const JWT_SECRET = "test-secret-key";
    const userId = 123;
    const email = "test@example.com";

    it("should generate a valid JWT token", () => {
        const token = generateToken(userId, email, JWT_SECRET);

        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
        expect(token.split(".")).toHaveLength(3);
    });

    it("should encode userId and email in the token", () => {
        const token = generateToken(userId, email, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        expect(decoded.userId).toBe(userId);
        expect(decoded.email).toBe(email);
    });

    it("should set token expiration to 1 day", () => {
        const token = generateToken(userId, email, JWT_SECRET);
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        expect(decoded.exp).toBeDefined();
        expect(decoded.iat).toBeDefined();

        const expirationDuration = decoded.exp - decoded.iat;
        expect(expirationDuration).toBe(86400);
    });

    it("should generate different tokens for different users", () => {
        const token1 = generateToken(1, "user1@example.com", JWT_SECRET);
        const token2 = generateToken(2, "user2@example.com", JWT_SECRET);

        expect(token1).not.toBe(token2);
    });

    it("should generate different tokens at different times for the same user", async () => {
        const token1 = generateToken(userId, email, JWT_SECRET);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const token2 = generateToken(userId, email, JWT_SECRET);

        expect(token1).not.toBe(token2);
    });
});
