import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import router from "./edit.js";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock dependencies
vi.mock("../db.js");
vi.mock("bcrypt");
vi.mock("../hash/hashPassword.js");
vi.mock("../helpers/validateProfileUpdate.js");

const app = express();
app.use(express.json());
app.use("/user", router);

// Helper to generate valid JWT token
const generateToken = (userId: number) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "test-secret", { expiresIn: "1h" });
};

describe("User Routes", () => {
    let mockQuery: any;
    let mockConnect: any;
    let mockClient: any;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup mock client for transactions
        mockClient = {
            query: vi.fn(),
            release: vi.fn(),
        };

        mockQuery = vi.fn();
        mockConnect = vi.fn().mockResolvedValue(mockClient);

        (pool as any).query = mockQuery;
        (pool as any).connect = mockConnect;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /user/password", () => {
        const token = generateToken(1);

        it("should successfully update password", async () => {
            const { hashPassword } = await import("../hash/hashPassword.js");

            mockQuery
                .mockResolvedValueOnce({ rows: [{ password_hash: "hashed_old_password" }] }) // SELECT query
                .mockResolvedValueOnce({ rows: [] }); // UPDATE query

            (bcrypt.compare as any).mockResolvedValue(true);
            (hashPassword as any).mockResolvedValue("hashed_new_password");

            const response = await request(app).post("/user/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "OldPass123",
                newPassword: "NewPass123",
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Password updated successfully",
            });
            expect(mockQuery).toHaveBeenCalledTimes(2);
        });

        it("should return 400 if old password is missing", async () => {
            const response = await request(app).post("/user/password").set("Authorization", `Bearer ${token}`).send({
                newPassword: "NewPass123",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Old password and new password are required");
        });

        it("should return 400 if new password is missing", async () => {
            const response = await request(app).post("/user/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "OldPass123",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Old password and new password are required");
        });

        it("should return 400 if new password is too short", async () => {
            const response = await request(app).post("/user/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "OldPass123",
                newPassword: "short",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("New password must be at least 8 characters long");
        });

        it("should return 404 if user not found", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] });

            const response = await request(app).post("/user/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "OldPass123",
                newPassword: "NewPass123",
            });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("User not found");
        });

        it("should return 401 if old password is incorrect", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ password_hash: "hashed_old_password" }] });
            (bcrypt.compare as any).mockResolvedValue(false);

            const response = await request(app).post("/user/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "WrongPass123",
                newPassword: "NewPass123",
            });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Current password is incorrect");
        });

        it("should return 500 on database error", async () => {
            mockQuery.mockRejectedValueOnce(new Error("Database error"));

            const response = await request(app).post("/user/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "OldPass123",
                newPassword: "NewPass123",
            });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Failed to update password");
        });
    });

    describe("POST /user/email", () => {
        const token = generateToken(1);

        it("should successfully update email", async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [{ email: "old@example.com" }] }) // SELECT query
                .mockResolvedValueOnce({ rows: [] }); // UPDATE query

            const response = await request(app).post("/user/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
                newEmail: "new@example.com",
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Email updated successfully",
            });
        });

        it("should return 400 if old email is missing", async () => {
            const response = await request(app).post("/user/email").set("Authorization", `Bearer ${token}`).send({
                newEmail: "new@example.com",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Old password and new password are required");
        });

        it("should return 400 if new email is missing", async () => {
            const response = await request(app).post("/user/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Old password and new password are required");
        });

        it("should return 404 if user not found", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] });

            const response = await request(app).post("/user/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
                newEmail: "new@example.com",
            });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("User not found");
        });

        it("should return 401 if old email is incorrect", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ email: "old@example.com" }] });

            const response = await request(app).post("/user/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "wrong@example.com",
                newEmail: "new@example.com",
            });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Current email is incorrect");
        });

        it("should return 500 on database error", async () => {
            mockQuery.mockRejectedValueOnce(new Error("Database error"));

            const response = await request(app).post("/user/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
                newEmail: "new@example.com",
            });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Failed to update email");
        });
    });

    describe("POST /user/profile", () => {
        const token = generateToken(1);

        beforeEach(async () => {
            const { validateProfileUpdate } = await import("../helpers/validateProfileUpdate.js");
            (validateProfileUpdate as any).mockReturnValue({ valid: true, errors: [] });
        });

        it("should successfully update profile with all fields", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // BEGIN
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // User check
                .mockResolvedValueOnce({ rows: [] }) // UPDATE users
                .mockResolvedValueOnce({
                    rows: [
                        { id: 1, name: "football" },
                        { id: 2, name: "basketball" },
                    ],
                }) // Category check
                .mockResolvedValueOnce({ rows: [] }) // DELETE categories
                .mockResolvedValueOnce({ rows: [] }) // INSERT categories
                .mockResolvedValueOnce({
                    rows: [
                        {
                            id: 1,
                            email: "user@example.com",
                            user_name: "John Doe",
                            current_location: "New York",
                            bio: "Test bio",
                            updated_at: new Date().toString(),
                            categories: ["football", "basketball"],
                        },
                    ],
                }) // SELECT user with categories
                .mockResolvedValueOnce({ rows: [] }); // COMMIT

            const response = await request(app)
                .post("/user/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userName: "John Doe",
                    currentLocation: "New York",
                    bio: "Test bio",
                    categories: ["football", "basketball"],
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Profile updated successfully");
            expect(response.body.user).toHaveProperty("userName", "John Doe");
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should successfully update only userName", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // BEGIN
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // User check
                .mockResolvedValueOnce({ rows: [] }) // UPDATE users
                .mockResolvedValueOnce({
                    rows: [
                        {
                            id: 1,
                            email: "user@example.com",
                            user_name: "Jane Doe",
                            current_location: null,
                            bio: null,
                            updated_at: new Date(),
                            categories: [],
                        },
                    ],
                }) // SELECT user
                .mockResolvedValueOnce({ rows: [] }); // COMMIT

            const response = await request(app).post("/user/profile").set("Authorization", `Bearer ${token}`).send({
                userName: "Jane Doe",
            });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user.userName).toBe("Jane Doe");
        });

        it("should return 400 if validation fails", async () => {
            const { validateProfileUpdate } = await import("../helpers/validateProfileUpdate.js");
            (validateProfileUpdate as any).mockReturnValue({
                valid: false,
                errors: ["userName is invalid"],
            });

            const response = await request(app).post("/user/profile").set("Authorization", `Bearer ${token}`).send({
                userName: "",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Validation failed");
            expect(response.body.errors).toEqual(["userName is invalid"]);
        });

        it("should return 400 if no fields provided", async () => {
            const response = await request(app).post("/user/profile").set("Authorization", `Bearer ${token}`).send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("At least one field must be provided to update");
        });

        it("should return 404 if user not found", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // BEGIN
                .mockResolvedValueOnce({ rows: [] }) // User check (empty)
                .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

            const response = await request(app).post("/user/profile").set("Authorization", `Bearer ${token}`).send({
                userName: "John Doe",
            });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("User not found");
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should return 400 if invalid categories provided", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // BEGIN
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // User check
                .mockResolvedValueOnce({ rows: [] }) // UPDATE users
                .mockResolvedValueOnce({ rows: [{ id: 1, name: "Sports" }] }) // Category check (only 1 found)
                .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

            const response = await request(app)
                .post("/user/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    userName: "John Doe",
                    categories: ["Sports", "InvalidCategory"],
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid categories provided");
            expect(response.body.invalidCategories).toEqual(["InvalidCategory"]);
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should remove all categories if empty array provided", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // BEGIN
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // User check
                .mockResolvedValueOnce({ rows: [] }) // UPDATE users
                .mockResolvedValueOnce({ rows: [] }) // DELETE categories
                .mockResolvedValueOnce({
                    rows: [
                        {
                            id: 1,
                            email: "user@example.com",
                            user_name: "John Doe",
                            current_location: null,
                            bio: null,
                            updated_at: new Date(),
                            categories: [],
                        },
                    ],
                }) // SELECT user
                .mockResolvedValueOnce({ rows: [] }); // COMMIT

            const response = await request(app).post("/user/profile").set("Authorization", `Bearer ${token}`).send({
                userName: "John Doe",
                categories: [],
            });

            expect(response.status).toBe(200);
            expect(response.body.user.categories).toEqual([]);
        });

        it("should rollback and return 500 on database error", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // BEGIN
                .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // User check
                .mockRejectedValueOnce(new Error("Database error")) // UPDATE fails
                .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

            const response = await request(app).post("/user/profile").set("Authorization", `Bearer ${token}`).send({
                userName: "John Doe",
            });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Failed to update profile");
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
});
