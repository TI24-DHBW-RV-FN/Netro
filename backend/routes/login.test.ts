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
            first_name: "John",
            last_name: "Doe",
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
            first_name: "John",
            last_name: "Doe",
        };

        const token = "jwt_token_123";

        vi.mocked(pool.query)
            .mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any)

            .mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 1,
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
                firstName: mockUser.first_name,
                lastName: mockUser.last_name,
            },
        });
    });

    it("should update last_login timestamp on successful login", async () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password_hash: "hashed_password",
            first_name: "John",
            last_name: "Doe",
        };

        vi.mocked(pool.query)
            .mockResolvedValueOnce({
                rows: [mockUser],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any)
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 1,
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
