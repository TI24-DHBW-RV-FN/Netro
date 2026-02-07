import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import registerRouter from "./register.js";
import * as hashPasswordModule from "../hash/hashPassword.js";
import * as generateTokenModule from "../auth/generateToken.js";
import { pool } from "../db.js";

vi.mock("../hash/hashPassword");
vi.mock("../auth/generateToken");
vi.mock("../db", () => ({
    pool: {
        query: vi.fn(),
    },
}));

const app = express();
app.use(express.json());
app.use("/register", registerRouter);

describe("POST /register", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = "test-secret";
    });

    it("should return 400 if required fields are missing", async () => {
        const response = await request(app).post("/register").send({
            email: "test@example.com",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Email, password, first and last name are required",
        });
    });

    it("should return 409 if user already exists", async () => {
        vi.mocked(pool.query).mockResolvedValueOnce({
            rows: [{ id: 1 }],
            command: "",
            rowCount: 1,
            oid: 0,
            fields: [],
        } as any);

        const response = await request(app).post("/register").send({
            email: "existing@example.com",
            password: "password123",
            firstName: "John",
            lastName: "Doe",
        });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            success: false,
            message: "User with this email already exists",
        });
    });

    it("should successfully register a new user", async () => {
        const hashedPassword = "hashed_password_123";
        const token = "jwt_token_123";
        const newUser = {
            id: 1,
            email: "new@example.com",
            first_name: "Jane",
            last_name: "Smith",
            created_at: new Date("2024-01-01").toString(),
        };

        vi.mocked(pool.query)
            .mockResolvedValueOnce({
                rows: [],
                command: "",
                rowCount: 0,
                oid: 0,
                fields: [],
            } as any)

            .mockResolvedValueOnce({
                rows: [newUser],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any);

        vi.mocked(hashPasswordModule.hashPassword).mockResolvedValue(hashedPassword);
        vi.mocked(generateTokenModule.generateToken).mockReturnValue(token);

        const response = await request(app).post("/register").send({
            email: "new@example.com",
            password: "password123",
            firstName: "Jane",
            lastName: "Smith",
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                createdAt: newUser.created_at,
            },
        });
    });

    it("should hash the password before storing", async () => {
        const password = "mySecurePassword";
        const hashedPassword = "hashed_password";

        vi.mocked(pool.query)
            .mockResolvedValueOnce({ rows: [], command: "", rowCount: 0, oid: 0, fields: [] } as any)
            .mockResolvedValueOnce({
                rows: [
                    {
                        id: 1,
                        email: "test@example.com",
                        first_name: "Test",
                        last_name: "User",
                        created_at: new Date(),
                    },
                ],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            } as any);

        vi.mocked(hashPasswordModule.hashPassword).mockResolvedValue(hashedPassword);
        vi.mocked(generateTokenModule.generateToken).mockReturnValue("token");

        await request(app).post("/register").send({
            email: "test@example.com",
            password,
            firstName: "Test",
            lastName: "User",
        });

        expect(hashPasswordModule.hashPassword).toHaveBeenCalledWith(password);
        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO users"), expect.arrayContaining([hashedPassword]));
    });

    it("should return 500 on database error", async () => {
        vi.mocked(pool.query).mockRejectedValue(new Error("Database error"));

        const response = await request(app).post("/register").send({
            email: "test@example.com",
            password: "password123",
            firstName: "John",
            lastName: "Doe",
        });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Registration failed",
        });
    });
});
