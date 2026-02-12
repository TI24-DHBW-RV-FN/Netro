import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import profileRouter from "./profile.js";
import { pool } from "../db.js";

vi.mock("../db", () => ({
    pool: {
        query: vi.fn(),
    },
}));

const app = express();
app.use(express.json());
app.use("/profile", profileRouter);

describe("GET /profile", () => {
    const JWT_SECRET = "test-secret";

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = JWT_SECRET;
    });

    it("should return 401 if no token is provided", async () => {
        const response = await request(app).get("/profile");

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: "Access token is required",
        });
    });

    it("should return 403 if token is invalid", async () => {
        const response = await request(app).get("/profile").set("Authorization", "Bearer invalid-token");

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

        const token = jwt.sign({ userId: 1, email: "test@example.com" }, JWT_SECRET, { expiresIn: "1d" });

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

        const response = await request(app).get("/profile").set("Authorization", `Bearer ${token}`);

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
        expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining("FROM categories c"), [1]);
        expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining("INNER JOIN user_categories uc"), [1]);
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

        const token = jwt.sign({ userId: 1, email: "test@example.com" }, JWT_SECRET, { expiresIn: "1d" });

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

        const response = await request(app).get("/profile").set("Authorization", `Bearer ${token}`);

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

        const token = jwt.sign({ userId: 1, email: "test@example.com" }, JWT_SECRET, { expiresIn: "1d" });

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

        const response = await request(app).get("/profile").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.user.categories).toEqual(mockCategories);

        // Verify ORDER BY clause is in the query
        expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining("ORDER BY c.name"), [1]);
    });

    it("should return 404 if user is not found in database", async () => {
        const token = jwt.sign({ userId: 999, email: "nonexistent@example.com" }, JWT_SECRET, { expiresIn: "1d" });

        vi.mocked(pool.query).mockResolvedValueOnce({
            rows: [],
            command: "",
            rowCount: 0,
            oid: 0,
            fields: [],
        } as any);

        const response = await request(app).get("/profile").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            message: "User not found",
        });

        // Should not attempt to fetch categories if user not found
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it("should query the correct user from the token", async () => {
        const token = jwt.sign({ userId: 42, email: "specific@example.com" }, JWT_SECRET, { expiresIn: "1d" });

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

        await request(app).get("/profile").set("Authorization", `Bearer ${token}`);

        // Verify both queries use the correct userId
        expect(pool.query).toHaveBeenNthCalledWith(1, expect.stringContaining("WHERE id = $1"), [42]);
        expect(pool.query).toHaveBeenNthCalledWith(2, expect.stringContaining("WHERE uc.user_id = $1"), [42]);
    });

    it("should return 500 on database error", async () => {
        const token = jwt.sign({ userId: 1, email: "test@example.com" }, JWT_SECRET, { expiresIn: "1d" });

        vi.mocked(pool.query).mockRejectedValue(new Error("Database error"));

        const response = await request(app).get("/profile").set("Authorization", `Bearer ${token}`);

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

        const token = jwt.sign({ userId: 1, email: "test@example.com" }, JWT_SECRET, { expiresIn: "1d" });

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

        const response = await request(app).get("/profile").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Failed to fetch user profile",
        });
    });
});
