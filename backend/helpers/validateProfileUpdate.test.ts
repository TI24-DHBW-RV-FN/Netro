import { describe, it, expect } from "vitest";
import { validateProfileUpdate } from "./validateProfileUpdate.js";

describe("validateProfileUpdate", () => {
    it("should return valid for empty data", () => {
        const result = validateProfileUpdate({});
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it("should reject email changes", () => {
        const result = validateProfileUpdate({ email: "new@example.com" });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Email cannot be changed through this endpoint");
    });

    it("should reject password changes", () => {
        const result = validateProfileUpdate({ password: "newpassword123" });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Password cannot be changed through this endpoint");
    });

    describe("userName validation", () => {
        it("should accept valid userName", () => {
            const result = validateProfileUpdate({ userName: "JohnDoe" });
            expect(result.valid).toBe(true);
        });

        it("should accept null userName", () => {
            const result = validateProfileUpdate({ userName: null });
            expect(result.valid).toBe(true);
        });

        it("should reject non-string userName", () => {
            const result = validateProfileUpdate({ userName: 123 });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("userName must be a string");
        });

        it("should reject userName exceeding 100 characters", () => {
            const result = validateProfileUpdate({ userName: "a".repeat(101) });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("userName must not exceed 100 characters");
        });

        it("should accept userName with exactly 100 characters", () => {
            const result = validateProfileUpdate({ userName: "a".repeat(100) });
            expect(result.valid).toBe(true);
        });
    });

    describe("currentLocation validation", () => {
        it("should accept valid currentLocation", () => {
            const result = validateProfileUpdate({ currentLocation: "New York" });
            expect(result.valid).toBe(true);
        });

        it("should accept null currentLocation", () => {
            const result = validateProfileUpdate({ currentLocation: null });
            expect(result.valid).toBe(true);
        });

        it("should reject non-string currentLocation", () => {
            const result = validateProfileUpdate({ currentLocation: 123 });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("currentLocation must be a string");
        });

        it("should reject currentLocation exceeding 100 characters", () => {
            const result = validateProfileUpdate({ currentLocation: "a".repeat(101) });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("currentLocation must not exceed 100 characters");
        });
    });

    describe("bio validation", () => {
        it("should accept valid bio", () => {
            const result = validateProfileUpdate({ bio: "Software developer" });
            expect(result.valid).toBe(true);
        });

        it("should accept null bio", () => {
            const result = validateProfileUpdate({ bio: null });
            expect(result.valid).toBe(true);
        });

        it("should reject non-string bio", () => {
            const result = validateProfileUpdate({ bio: 123 });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("bio must be a string");
        });

        it("should reject bio exceeding 100 characters", () => {
            const result = validateProfileUpdate({ bio: "a".repeat(101) });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("bio must not exceed 100 characters");
        });
    });

    describe("categories validation", () => {
        it("should accept valid categories array", () => {
            const result = validateProfileUpdate({ categories: ["tech", "design"] });
            expect(result.valid).toBe(true);
        });

        it("should accept null categories", () => {
            const result = validateProfileUpdate({ categories: null });
            expect(result.valid).toBe(true);
        });

        it("should accept empty categories array", () => {
            const result = validateProfileUpdate({ categories: [] });
            expect(result.valid).toBe(true);
        });

        it("should reject non-array categories", () => {
            const result = validateProfileUpdate({ categories: "tech" });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("categories must be an array");
        });

        it("should reject categories with non-string elements", () => {
            const result = validateProfileUpdate({ categories: ["tech", 123, "design"] });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("all categories must be strings");
        });

        it("should reject categories with all non-string elements", () => {
            const result = validateProfileUpdate({ categories: [123, 456] });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("all categories must be strings");
        });
    });

    describe("multiple validation errors", () => {
        it("should collect multiple errors", () => {
            const result = validateProfileUpdate({
                email: "new@example.com",
                password: "newpass",
                userName: 123,
                bio: "a".repeat(101),
            });
            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(4);
            expect(result.errors).toContain("Email cannot be changed through this endpoint");
            expect(result.errors).toContain("Password cannot be changed through this endpoint");
            expect(result.errors).toContain("userName must be a string");
            expect(result.errors).toContain("bio must not exceed 100 characters");
        });
    });

    describe("valid complex update", () => {
        it("should accept valid profile update with multiple fields", () => {
            const result = validateProfileUpdate({
                userName: "JohnDoe",
                currentLocation: "San Francisco",
                bio: "Full-stack developer",
                categories: ["javascript", "typescript", "react"],
            });
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
});
