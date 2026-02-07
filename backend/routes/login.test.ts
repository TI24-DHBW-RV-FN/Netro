import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import loginRouter from "./login.js";
import * as comparePasswordModule from "../hash/comparePassword.js";
import * as generateTokenModule from "../auth/generateToken.js";
import { pool } from "../db.js";

vi.mock("../hash/comparePassword");
vi.mock("../auth/generateToken");
vi.mock("../db", () => ({
    pool: {
        query: vi.fn(),
    },
}));

const app = express();
app.use(express.json());
app.use("/login", loginRouter);

describe("POST /login", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = "test-secret";
    });

    it("should return 400 if email or password is missing", async () => {
        const response = await request(app).post("/login").send({
            email: "test@example.com",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Email and password are required",
        });
    });

    it("should return 400 if email format is invalid", async () => {
        const response = await request(app).post("/login").send({
            email: "invalid-email",
            password: "password123",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid email format",
        });
    });

    it("should return 401 if user is not found", async () => {
        vi.mocked(pool.query).mockResolvedValueOnce({
            rows: [],
            command: "",
            rowCount: 0,
            oid: 0,
            fields: [],
        } as any);

        const response = await request(app).post("/login").send({
            email: "nonexistent@example.com",
            password: "password123",
        });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid email or password",
        });
    });

    it("should return 401 if password is invalid", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password_hash: "hashed_password",
            user_name: "JohnDoe",
            current_location: "New York",
            bio: "Test bio",
        };

        vi.mocked(pool.query).mockResolvedValueOnce({
            rows: [mockUser],
            command: "",
            rowCount: 1,
            oid: 0,
            fields: [],
        } as any);

        vi.mocked(comparePasswordModule.comparePassword).mockResolvedValue(false);

        const response = await request(app).post("/login").send({
            email: "test@example.com",
            password: "wrongpassword",
        });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid email or password",
        });
    });

    it("should successfully login with valid credentials", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password_hash: "hashed_password",
            user_name: "JohnDoe",
            current_location: "New York",
            bio: "Test bio",
        };

        const mockCategories = [{ name: "basketball" }, { name: "programming" }];

        const token = "jwt_token_123";

        vi.mocked(pool.query)
            // First call: Get user
            .mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any)
            // Second call: Update last_login
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any)
            // Third call: Get categories
            .mockResolvedValueOnce({
                rows: mockCategories,
                command: "",
                rowCount: 2,
                oid: 0,
                fields: [],
            } as any);

        vi.mocked(comparePasswordModule.comparePassword).mockResolvedValue(true);
        vi.mocked(generateTokenModule.generateToken).mockReturnValue(token);

        const response = await request(app).post("/login").send({
            email: "test@example.com",
            password: "correctpassword",
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: mockUser.id,
                email: mockUser.email,
                userName: mockUser.user_name,
                currentLocation: mockUser.current_location,
                bio: mockUser.bio,
                categories: ["basketball", "programming"],
            },
        });
    });

    it("should update last_login timestamp on successful login", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password_hash: "hashed_password",
            user_name: "JohnDoe",
            current_location: "New York",
            bio: "Test bio",
        };

        vi.mocked(pool.query)
            // First call: Get user
            .mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any)
            // Second call: Update last_login
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any)
            // Third call: Get categories
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 0,
                oid: 0,
                fields: [],
            } as any);

        vi.mocked(comparePasswordModule.comparePassword).mockResolvedValue(true);
        vi.mocked(generateTokenModule.generateToken).mockReturnValue("token");

        await request(app).post("/login").send({
            email: "test@example.com",
            password: "correctpassword",
        });

        expect(pool.query).toHaveBeenCalledWith("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [mockUser.id]);
    });

    it("should return empty categories array if user has no categories", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password_hash: "hashed_password",
            user_name: "JohnDoe",
            current_location: null,
            bio: null,
        };

        const token = "jwt_token_123";

        vi.mocked(pool.query)
            // First call: Get user
            .mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any)
            // Second call: Update last_login
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any)
            // Third call: Get categories (empty)
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 0,
                oid: 0,
                fields: [],
            } as any);

        vi.mocked(comparePasswordModule.comparePassword).mockResolvedValue(true);
        vi.mocked(generateTokenModule.generateToken).mockReturnValue(token);

        const response = await request(app).post("/login").send({
            email: "test@example.com",
            password: "correctpassword",
        });

        expect(response.status).toBe(200);
        expect(response.body.user.categories).toEqual([]);
    });

    it("should return 500 on database error", async () => {
        vi.mocked(pool.query).mockRejectedValue(new Error("Database error"));

        const response = await request(app).post("/login").send({
            email: "test@example.com",
            password: "password123",
        });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Login failed",
        });
    });
});
