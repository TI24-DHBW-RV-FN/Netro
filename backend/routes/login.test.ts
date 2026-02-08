import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import loginRouter from "./login";
import * as comparePasswordModule from "../hash/comparePassword";
import * as generateTokenModule from "../token/generateToken";
import { pool } from "../db";

vi.mock("../hash/comparePassword");
vi.mock("../token/generateToken");
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
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return 400 if email or password is missing", async () => {
        const response = await request(app).post("/login").send({
            email: "test@example.com",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: expect.any(String),
        });
    });

    it("should return 400 if email format is invalid", async () => {
        const response = await request(app).post("/login").send({
            email: "invalid-email",
            password: "password123",
        });

        expect(response.status).toBe(400);
    });

    it("should return 401 if user is not found", async () => {
        vi.mocked(pool.query).mockResolvedValue({
            rows: [],
            command: "",
            oid: 0,
            fields: [],
            rowCount: 0,
        });

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
        vi.mocked(pool.query).mockResolvedValue({
            rows: [{ id: 1, email: "test@example.com", password_hash: "hashedpw" }],
            command: "",
            oid: 0,
            fields: [],
            rowCount: 1,
        });

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
            password_hash: "hashedpassword",
            user_name: "testuser",
        };
        const token = "mock.jwt.token";

        // Mock user query
        vi.mocked(pool.query)
            .mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                oid: 0,
                fields: [],
                rowCount: 1,
            })
            // Mock last_login update
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                oid: 0,
                fields: [],
                rowCount: 1,
            })
            // Mock categories query
            .mockResolvedValueOnce({
                rows: [{ name: "Technology" }, { name: "Science" }],
                command: "",
                oid: 0,
                fields: [],
                rowCount: 2,
            });

        vi.mocked(comparePasswordModule.comparePassword).mockResolvedValue(true);
        // Use mockImplementation for synchronous function
        vi.mocked(generateTokenModule.generateToken).mockImplementation(() => token);

        const response = await request(app).post("/login").send({
            email: "test@example.com",
            password: "password123",
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
                categories: ["Technology", "Science"],
            },
        });
    });

    it("should update last_login timestamp on successful login", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password_hash: "hashedpassword",
        };

        vi.mocked(pool.query)
            .mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                oid: 0,
                fields: [],
                rowCount: 1,
            })
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                oid: 0,
                fields: [],
                rowCount: 1,
            })
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                oid: 0,
                fields: [],
                rowCount: 0,
            });

        vi.mocked(comparePasswordModule.comparePassword).mockResolvedValue(true);
        vi.mocked(generateTokenModule.generateToken).mockImplementation(() => "token");

        await request(app).post("/login").send({
            email: "test@example.com",
            password: "password123",
        });

        expect(pool.query).toHaveBeenCalledWith("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [mockUser.id]);
    });

    it("should return empty categories array if user has no categories", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password_hash: "hashedpassword",
            user_name: "testuser",
        };
        const token = "mock.jwt.token";

        vi.mocked(pool.query)
            .mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                oid: 0,
                fields: [],
                rowCount: 1,
            })
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                oid: 0,
                fields: [],
                rowCount: 1,
            })
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                oid: 0,
                fields: [],
                rowCount: 0,
            });

        vi.mocked(comparePasswordModule.comparePassword).mockResolvedValue(true);
        vi.mocked(generateTokenModule.generateToken).mockImplementation(() => token);

        const response = await request(app).post("/login").send({
            email: "test@example.com",
            password: "password123",
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
