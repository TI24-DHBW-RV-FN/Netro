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

    it("should return user profile for authenticated user", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            user_name: "hi", // ✅ Changed from userName to user_name (database column name)
            current_location: null, // ✅ Add this
            bio: null, // ✅ Add this
            created_at: new Date("2024-01-01"),
            last_login: new Date("2024-02-01"),
        };

        const token = jwt.sign({ userId: 1, email: "test@example.com" }, JWT_SECRET, { expiresIn: "1d" });

        vi.mocked(pool.query).mockResolvedValueOnce({
            rows: [mockUser],
            command: "",
            rowCount: 1,
            oid: 0,
            fields: [],
        } as any);

        const response = await request(app).get("/profile").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            user: {
                id: mockUser.id,
                email: mockUser.email,
                userName: mockUser.user_name, // ✅ The response converts to camelCase
                currentLocation: mockUser.current_location, // ✅ Add this
                bio: mockUser.bio, // ✅ Add this
                createdAt: mockUser.created_at.toISOString(),
                lastLogin: mockUser.last_login.toISOString(),
            },
        });
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
    });

    it("should query the correct user from the token", async () => {
        const token = jwt.sign({ userId: 42, email: "specific@example.com" }, JWT_SECRET, { expiresIn: "1d" });

        vi.mocked(pool.query).mockResolvedValueOnce({
            rows: [
                {
                    id: 42,
                    email: "specific@example.com",
                    first_name: "Jane",
                    last_name: "Smith",
                    created_at: new Date(),
                    last_login: new Date(),
                },
            ],
            command: "",
            rowCount: 1,
            oid: 0,
            fields: [],
        } as any);

        await request(app).get("/profile").set("Authorization", `Bearer ${token}`);

        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("WHERE id = $1"), [42]);
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
});
