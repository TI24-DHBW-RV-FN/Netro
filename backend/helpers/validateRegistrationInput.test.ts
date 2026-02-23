import { describe, it, expect } from "vitest";
import { validateRegistrationInput } from "./validateRegistrationInput.js";

describe("validateRegistrationInput", () => {
    describe("Email validation", () => {
        it("should pass with valid email, password, and userName", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
            });

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should fail when email is missing", () => {
            const result = validateRegistrationInput({
                password: "password123",
                userName: "JohnDoe",
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Email is required and must be a string");
        });

        it("should fail when email is not a string", () => {
            const result = validateRegistrationInput({
                email: 123,
                password: "password123",
                userName: "JohnDoe",
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Email is required and must be a string");
        });

        it("should fail when email format is invalid", () => {
            const result = validateRegistrationInput({
                email: "invalid-email",
                password: "password123",
                userName: "JohnDoe",
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Email must be a valid email address");
        });

        it("should fail with multiple invalid email formats", () => {
            const invalidEmails = ["test", "test@", "@example.com", "test @example.com"];

            invalidEmails.forEach((email) => {
                const result = validateRegistrationInput({
                    email,
                    password: "password123",
                    userName: "JohnDoe",
                });

                expect(result.valid).toBe(false);
                expect(result.errors).toContain("Email must be a valid email address");
            });
        });
    });

    describe("Password validation", () => {
        it("should pass with valid password", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
            });

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should fail when password is missing", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                userName: "JohnDoe",
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Password is required and must be a string");
        });

        it("should fail when password is not a string", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: 12345678,
                userName: "JohnDoe",
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Password is required and must be a string");
        });

        it("should fail when password is too short", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "short",
                userName: "JohnDoe",
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Password must be at least 8 characters long");
        });
    });

    describe("UserName validation", () => {
        it("should pass with valid userName", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
            });

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should fail when userName is missing", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("userName is required and must be a string");
        });

        it("should fail when userName is not a string", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: 123,
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("userName is required and must be a string");
        });

        it("should fail when userName is empty string", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "",
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("userName cannot be empty or just whitespace");
        });

        it("should fail when userName is only whitespace", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "   ",
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("userName cannot be empty or just whitespace");
        });

        it("should fail when userName exceeds 100 characters", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "a".repeat(101),
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("userName must not exceed 100 characters");
        });

        it("should fail when userName is null", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: null,
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("userName is required and must be a string");
        });
    });

    describe("Optional fields validation", () => {
        it("should pass with valid optional fields", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
                currentLocation: "New York",
                bio: "Test bio",
                categories: ["basketball", "programming"],
            });

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should pass when optional fields are missing", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
            });

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should fail when currentLocation is not a string", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
                currentLocation: 123,
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("currentLocation must be a string");
        });

        it("should fail when currentLocation exceeds 100 characters", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
                currentLocation: "a".repeat(101),
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("currentLocation must not exceed 100 characters");
        });

        it("should fail when bio is not a string", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
                bio: 123,
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("bio must be a string");
        });

        it("should fail when bio exceeds 100 characters", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
                bio: "a".repeat(101),
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("bio must not exceed 100 characters");
        });

        it("should pass when optional fields (except userName) are null", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
                currentLocation: null,
                bio: null,
                categories: null,
            });

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });
    });

    describe("Categories validation", () => {
        it("should pass with valid categories array", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
                categories: ["basketball", "football", "programming"],
            });

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should pass with empty categories array", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
                categories: [],
            });

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should fail when categories is not an array", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
                categories: "basketball",
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("categories must be an array");
        });

        it("should fail when categories contains non-string values", () => {
            const result = validateRegistrationInput({
                email: "test@example.com",
                password: "password123",
                userName: "JohnDoe",
                categories: ["basketball", 123, "football"],
            });

            expect(result.valid).toBe(false);
            expect(result.errors).toContain("all categories must be strings");
        });
    });

    describe("Multiple validation errors", () => {
        it("should return all validation errors", () => {
            const result = validateRegistrationInput({
                email: "invalid-email",
                password: "short",
                userName: "   ",
                bio: "a".repeat(101),
                categories: "not-an-array",
            });

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
            expect(result.errors).toContain("Email must be a valid email address");
            expect(result.errors).toContain("Password must be at least 8 characters long");
            expect(result.errors).toContain("userName cannot be empty or just whitespace");
            expect(result.errors).toContain("bio must not exceed 100 characters");
            expect(result.errors).toContain("categories must be an array");
        });

        it("should return multiple errors when all required fields are missing", () => {
            const result = validateRegistrationInput({});

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBe(3);
            expect(result.errors).toContain("Email is required and must be a string");
            expect(result.errors).toContain("Password is required and must be a string");
            expect(result.errors).toContain("userName is required and must be a string");
        });
    });
});
