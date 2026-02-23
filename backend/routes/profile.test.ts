import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import profileRouter from "./profile.js";
import { pool } from "../db.js";
import bcrypt from "bcrypt";

vi.mock("../db", () => ({
    pool: {
        query: vi.fn(),
        connect: vi.fn(),
    },
}));
vi.mock("bcrypt");
vi.mock("../hash/hashPassword.js");
vi.mock("../helpers/validateProfileUpdate.js");
vi.mock("../email/sendVerificationEmail.js");

const app = express();
app.use(express.json());
app.use("/profile", profileRouter);

const JWT_SECRET = "test-secret";

// Helper to generate valid JWT token
const generateToken = (userId: number) => {
    return jwt.sign({ userId, email: "test@example.com" }, JWT_SECRET, { expiresIn: "1h" });
};

describe("Profile Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = JWT_SECRET;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("GET /profile/info", () => {
        it("should return 401 if no token is provided", async () => {
            const response = await request(app).get("/profile/info");

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: "Access token is required",
            });
        });

        it("should return 403 if token is invalid", async () => {
            const response = await request(app).get("/profile/info").set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(403);
            expect(response.body).toEqual({
                success: false,
                message: "Invalid or expired token",
            });
        });

        it("should return user profile with categories for authenticated user", async () => {
            const mockUser = {
                id: 1,
                user_name: "hi",
                current_location: null,
                bio: null,
                created_at: new Date("2024-01-01"),
                updated_at: new Date("2024-01-15"),
                last_login: new Date("2024-02-01"),
            };

            const mockCategories = [
                { id: 1, name: "basketball" },
                { id: 2, name: "programming" },
            ];

            const token = generateToken(1);

            // Mock first query (user data)
            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any);

            // Mock second query (categories)
            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: mockCategories,
                command: "",
                rowCount: 2,
                oid: 0,
                fields: [],
            } as any);

            const response = await request(app).get("/profile/info").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: "",
                success: true,
                user: {
                    id: mockUser.id,
                    userName: mockUser.user_name,
                    currentLocation: mockUser.current_location,
                    bio: mockUser.bio,
                    createdAt: mockUser.created_at.toISOString(),
                    updatedAt: mockUser.updated_at.toISOString(),
                    lastLogin: mockUser.last_login.toISOString(),
                    categories: [
                        { id: 1, name: "basketball" },
                        { id: 2, name: "programming" },
                    ],
                },
            });

            // Verify categories query was called with correct SQL and userId
            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining("FROM category c"), [1]);
            expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining("INNER JOIN users_categories uc"), [1]);
        });

        it("should return user profile with empty categories array when user has no categories", async () => {
            const mockUser = {
                id: 1,
                user_name: "hi",
                current_location: null,
                bio: null,
                created_at: new Date("2024-01-01"),
                updated_at: new Date("2024-01-15"),
                last_login: new Date("2024-02-01"),
            };

            const token = generateToken(1);

            // Mock first query (user data)
            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any);

            // Mock second query (no categories)
            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 0,
                oid: 0,
                fields: [],
            } as any);

            const response = await request(app).get("/profile/info").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.user.categories).toEqual([]);
        });

        it("should return categories sorted by name", async () => {
            const mockUser = {
                id: 1,
                user_name: "hi",
                current_location: null,
                bio: null,
                created_at: new Date("2024-01-01"),
                updated_at: new Date("2024-01-15"),
                last_login: new Date("2024-02-01"),
            };

            const mockCategories = [
                { id: 3, name: "basketball" },
                { id: 1, name: "cycling" },
                { id: 5, name: "programming" },
                { id: 2, name: "yoga" },
            ];

            const token = generateToken(1);

            // Mock first query (user data)
            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any);

            // Mock second query (categories already sorted from DB)
            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: mockCategories,
                command: "",
                rowCount: 4,
                oid: 0,
                fields: [],
            } as any);

            const response = await request(app).get("/profile/info").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.user.categories).toEqual(mockCategories);

            // Verify ORDER BY clause is in the query
            expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining("ORDER BY c.name"), [1]);
        });

        it("should return 404 if user is not found in database", async () => {
            const token = generateToken(999);

            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 0,
                oid: 0,
                fields: [],
            } as any);

            const response = await request(app).get("/profile/info").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success: false,
                message: "User not found",
            });

            // Should not attempt to fetch categories if user not found
            expect(pool.query).toHaveBeenCalledTimes(1);
        });

        it("should query the correct user from the token", async () => {
            const token = generateToken(42);

            // Mock first query (user data)
            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: [
                    {
                        id: 42,
                        user_name: "Jane",
                        current_location: null,
                        bio: null,
                        created_at: new Date(),
                        updated_at: new Date(),
                        last_login: new Date(),
                    },
                ],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any);

            // Mock second query (categories)
            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 0,
                oid: 0,
                fields: [],
            } as any);

            await request(app).get("/profile/info").set("Authorization", `Bearer ${token}`);

            // Verify both queries use the correct userId
            expect(pool.query).toHaveBeenNthCalledWith(1, expect.stringContaining("WHERE id = $1"), [42]);
            expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining("WHERE uc.users_id = $1"), [42]);
        });

        it("should return 500 on database error", async () => {
            const token = generateToken(1);

            vi.mocked(pool.query).mockRejectedValue(new Error("Database error"));

            const response = await request(app).get("/profile/info").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                message: "Failed to fetch user profile",
            });
        });

        it("should return 500 on categories query error", async () => {
            const mockUser = {
                id: 1,
                user_name: "hi",
                current_location: null,
                bio: null,
                created_at: new Date("2024-01-01"),
                updated_at: new Date("2024-01-15"),
                last_login: new Date("2024-02-01"),
            };

            const token = generateToken(1);

            // Mock first query succeeds (user data)
            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any);

            // Mock second query fails (categories)
            vi.mocked(pool.query).mockRejectedValueOnce(new Error("Categories database error"));

            const response = await request(app).get("/profile/info").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                success: false,
                message: "Failed to fetch user profile",
            });
        });
    });

    describe("PUT /profile/edit/password", () => {
        const token = generateToken(1);

        it("should successfully update password", async () => {
            const { hashPassword } = await import("../hash/hashPassword.js");

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [{ password_hash: "hashed_old_password" }] } as any) // SELECT query
                .mockResolvedValueOnce({ rows: [] } as any); // UPDATE query

            (bcrypt.compare as any).mockResolvedValue(true);
            (hashPassword as any).mockResolvedValue("hashed_new_password");

            const response = await request(app).put("/profile/edit/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "OldPass123",
                newPassword: "NewPass123",
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Password updated successfully",
            });
            expect(pool.query).toHaveBeenCalledTimes(2);
        });

        it("should return 400 if old password is missing", async () => {
            const response = await request(app).put("/profile/edit/password").set("Authorization", `Bearer ${token}`).send({
                newPassword: "NewPass123",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Old password and new password are required");
        });

        it("should return 400 if new password is missing", async () => {
            const response = await request(app).put("/profile/edit/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "OldPass123",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Old password and new password are required");
        });

        it("should return 400 if new password is too short", async () => {
            const response = await request(app).put("/profile/edit/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "OldPass123",
                newPassword: "short",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("New password must be at least 8 characters long");
        });

        it("should return 404 if user not found", async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const response = await request(app).put("/profile/edit/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "OldPass123",
                newPassword: "NewPass123",
            });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("User not found");
        });

        it("should return 401 if old password is incorrect", async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ password_hash: "hashed_old_password" }] } as any);
            (bcrypt.compare as any).mockResolvedValue(false);

            const response = await request(app).put("/profile/edit/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "WrongPass123",
                newPassword: "NewPass123",
            });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Current password is incorrect");
        });

        it("should return 500 on database error", async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error("Database error"));

            const response = await request(app).put("/profile/edit/password").set("Authorization", `Bearer ${token}`).send({
                oldPassword: "OldPass123",
                newPassword: "NewPass123",
            });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Failed to update password");
        });
    });

    describe("PUT /profile/edit/email", () => {
        const token = generateToken(1);

        it("should successfully update email and send verification code", async () => {
            const { sendVerificationEmail } = await import("../email/sendVerificationEmail.js");
            (sendVerificationEmail as any).mockResolvedValue("123456");

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [{ email: "old@example.com" }] } as any) // SELECT current email
                .mockResolvedValueOnce({ rows: [] } as any) // Check if new email exists
                .mockResolvedValueOnce({ rows: [] } as any); // UPDATE query

            const response = await request(app).put("/profile/edit/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
                newEmail: "new@example.com",
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Email updated successfully",
            });
            expect(sendVerificationEmail).toHaveBeenCalledWith("new@example.com");
            expect(pool.query).toHaveBeenCalledTimes(3);
        });

        it("should return 400 if old email is missing", async () => {
            const response = await request(app).put("/profile/edit/email").set("Authorization", `Bearer ${token}`).send({
                newEmail: "new@example.com",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Old email and new email are required");
        });

        it("should return 400 if new email is missing", async () => {
            const response = await request(app).put("/profile/edit/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Old email and new email are required");
        });

        it("should return 404 if user not found", async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const response = await request(app).put("/profile/edit/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
                newEmail: "new@example.com",
            });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("User not found");
        });

        it("should return 401 if old email is incorrect", async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [{ email: "old@example.com" }] } as any);

            const response = await request(app).put("/profile/edit/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "wrong@example.com",
                newEmail: "new@example.com",
            });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Current email is incorrect");
        });

        it("should return 409 if new email already exists", async () => {
            const { sendVerificationEmail } = await import("../email/sendVerificationEmail.js");
            (sendVerificationEmail as any).mockResolvedValue("123456");

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [{ email: "old@example.com" }] } as any) // SELECT current email
                .mockResolvedValueOnce({ rows: [{ id: 2 }] } as any); // Email exists check

            const response = await request(app).put("/profile/edit/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
                newEmail: "existing@example.com",
            });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe("User with this email already exists");
        });

        it("should return 500 on database error", async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error("Database error"));

            const response = await request(app).put("/profile/edit/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
                newEmail: "new@example.com",
            });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Failed to update email");
        });
    });

    describe("PUT /profile/edit/info", () => {
        const token = generateToken(1);
        let mockClient: any;

        beforeEach(async () => {
            const { validateProfileUpdate } = await import("../helpers/validateProfileUpdate.js");
            (validateProfileUpdate as any).mockReturnValue({ valid: true, errors: [] });

            // Setup mock client for transactions
            mockClient = {
                query: vi.fn(),
                release: vi.fn(),
            };

            vi.mocked(pool.connect).mockResolvedValue(mockClient as any);
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
                            category: ["football", "basketball"],
                        },
                    ],
                }) // SELECT user with categories
                .mockResolvedValueOnce({ rows: [] }); // COMMIT

            const response = await request(app)
                .put("/profile/edit/info")
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
                            category: [],
                        },
                    ],
                }) // SELECT user
                .mockResolvedValueOnce({ rows: [] }); // COMMIT

            const response = await request(app).put("/profile/edit/info").set("Authorization", `Bearer ${token}`).send({
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

            const response = await request(app).put("/profile/edit/info").set("Authorization", `Bearer ${token}`).send({
                userName: "",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Validation failed");
            expect(response.body.errors).toEqual(["userName is invalid"]);
        });

        it("should return 400 if no fields provided", async () => {
            const response = await request(app).put("/profile/edit/info").set("Authorization", `Bearer ${token}`).send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("At least one field must be provided to update");
        });

        it("should return 404 if user not found", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // BEGIN
                .mockResolvedValueOnce({ rows: [] }) // User check (empty)
                .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

            const response = await request(app).put("/profile/edit/info").set("Authorization", `Bearer ${token}`).send({
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
                .put("/profile/edit/info")
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
                            category: [],
                        },
                    ],
                }) // SELECT user
                .mockResolvedValueOnce({ rows: [] }); // COMMIT

            const response = await request(app).put("/profile/edit/info").set("Authorization", `Bearer ${token}`).send({
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

            const response = await request(app).put("/profile/edit/info").set("Authorization", `Bearer ${token}`).send({
                userName: "John Doe",
            });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Failed to update profile");
            expect(mockClient.release).toHaveBeenCalled();
        });
        it("should return 400 if new email format is invalid", async () => {
            const response = await request(app).put("/profile/edit/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
                newEmail: "not-an-email",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid email format");
        });

        it("should return 400 if new email has no domain", async () => {
            const response = await request(app).put("/profile/edit/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
                newEmail: "user@",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid email format");
        });

        it("should return 400 if new email has no @ symbol", async () => {
            const response = await request(app).put("/profile/edit/email").set("Authorization", `Bearer ${token}`).send({
                oldEmail: "old@example.com",
                newEmail: "userexample.com",
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid email format");
        });
    });
});
