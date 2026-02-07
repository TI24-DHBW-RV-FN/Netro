import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import registerRouter from "./register.js";
import * as hashPasswordModule from "../hash/hashPassword.js";
import * as generateTokenModule from "../auth/generateToken.js";
import * as validateRegistrationModule from "../helpers/validateAllUserInput.js";
import { pool } from "../db.js";

vi.mock("../hash/hashPassword");
vi.mock("../auth/generateToken");
vi.mock("../helpers/validateAllUserInput");
vi.mock("../db", () => ({
    pool: {
        connect: vi.fn(),
    },
}));

const app = express();
app.use(express.json());
app.use("/register", registerRouter);

describe("POST /register", () => {
    let mockClient: any;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = "test-secret";

        mockClient = {
            query: vi.fn(),
            release: vi.fn(),
        };

        vi.mocked(pool.connect).mockResolvedValue(mockClient);
    });

    it("should return 400 if validation fails", async () => {
        vi.mocked(validateRegistrationModule.validateAllUserInput).mockReturnValue({
            valid: false,
            errors: ["Email is required and must be a string", "Password must be at least 8 characters long"],
        });

        const response = await request(app).post("/register").send({
            email: "test@example.com",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Validation failed",
            errors: ["Email is required and must be a string", "Password must be at least 8 characters long"],
        });
    });

    it("should return 409 if user already exists", async () => {
        vi.mocked(validateRegistrationModule.validateAllUserInput).mockReturnValue({
            valid: true,
            errors: [],
        });

        mockClient.query.mockResolvedValueOnce(undefined).mockResolvedValueOnce({
            rows: [{ id: 1 }],
            command: "",
            rowCount: 1,
            oid: 0,
            fields: [],
        });

        const response = await request(app).post("/register").send({
            email: "existing@example.com",
            password: "password123",
            userName: "JohnDoe",
        });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            success: false,
            message: "User with this email already exists",
        });
        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should successfully register a new user without categories", async () => {
        const hashedPassword = "hashed_password_123";
        const token = "jwt_token_123";
        const newUser = {
            id: 1,
            email: "new@example.com",
            user_name: "JaneSmith",
            current_location: "New York",
            bio: "Test bio",
            created_at: new Date("2024-01-01").toString(),
        };

        vi.mocked(validateRegistrationModule.validateAllUserInput).mockReturnValue({
            valid: true,
            errors: [],
        });

        mockClient.query
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ rows: [], command: "", rowCount: 0, oid: 0, fields: [] })
            .mockResolvedValueOnce({ rows: [newUser], command: "", rowCount: 1, oid: 0, fields: [] })
            .mockResolvedValueOnce(undefined);

        vi.mocked(hashPasswordModule.hashPassword).mockResolvedValue(hashedPassword);
        vi.mocked(generateTokenModule.generateToken).mockReturnValue(token);

        const response = await request(app).post("/register").send({
            email: "new@example.com",
            password: "password123",
            userName: "JaneSmith",
            currentLocation: "New York",
            bio: "Test bio",
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                userName: newUser.user_name,
                currentLocation: newUser.current_location,
                bio: newUser.bio,
                categories: [],
                createdAt: newUser.created_at,
            },
        });
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
        expect(mockClient.release).toHaveBeenCalled();
    });

    it("should successfully register a new user with categories", async () => {
        const hashedPassword = "hashed_password_123";
        const token = "jwt_token_123";
        const newUser = {
            id: 1,
            email: "new@example.com",
            user_name: "JaneSmith",
            current_location: "New York",
            bio: "Test bio",
            created_at: new Date("2024-01-01").toString(),
        };

        const categories = ["basketball", "programming"];
        const mockCategories = [
            { id: 1, name: "basketball" },
            { id: 2, name: "programming" },
        ];

        vi.mocked(validateRegistrationModule.validateAllUserInput).mockReturnValue({
            valid: true,
            errors: [],
        });

        mockClient.query
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ rows: [], command: "", rowCount: 0, oid: 0, fields: [] })
            .mockResolvedValueOnce({ rows: [newUser], command: "", rowCount: 1, oid: 0, fields: [] })
            .mockResolvedValueOnce({ rows: mockCategories, command: "", rowCount: 2, oid: 0, fields: [] })
            .mockResolvedValueOnce({ rows: [], command: "", rowCount: 2, oid: 0, fields: [] })
            .mockResolvedValueOnce(undefined);

        vi.mocked(hashPasswordModule.hashPassword).mockResolvedValue(hashedPassword);
        vi.mocked(generateTokenModule.generateToken).mockReturnValue(token);

        const response = await request(app).post("/register").send({
            email: "new@example.com",
            password: "password123",
            userName: "JaneSmith",
            currentLocation: "New York",
            bio: "Test bio",
            categories: categories,
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                userName: newUser.user_name,
                currentLocation: newUser.current_location,
                bio: newUser.bio,
                categories: categories,
                createdAt: newUser.created_at,
            },
        });
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
        expect(mockClient.release).toHaveBeenCalled();
    });

    it("should return 400 if invalid categories are provided", async () => {
        const hashedPassword = "hashed_password_123";
        const newUser = {
            id: 1,
            email: "new@example.com",
            user_name: "JaneSmith",
            current_location: "New York",
            bio: "Test bio",
            created_at: new Date("2024-01-01").toString(),
        };

        const categories = ["basketball", "invalidCategory", "programming"];
        const mockCategories = [
            { id: 1, name: "basketball" },
            { id: 2, name: "programming" },
        ];

        vi.mocked(validateRegistrationModule.validateAllUserInput).mockReturnValue({
            valid: true,
            errors: [],
        });

        mockClient.query
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ rows: [], command: "", rowCount: 0, oid: 0, fields: [] })
            .mockResolvedValueOnce({ rows: [newUser], command: "", rowCount: 1, oid: 0, fields: [] })
            .mockResolvedValueOnce({ rows: mockCategories, command: "", rowCount: 2, oid: 0, fields: [] });

        vi.mocked(hashPasswordModule.hashPassword).mockResolvedValue(hashedPassword);

        const response = await request(app).post("/register").send({
            email: "new@example.com",
            password: "password123",
            userName: "JaneSmith",
            currentLocation: "New York",
            bio: "Test bio",
            categories: categories,
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: "Invalid categories provided",
            invalidCategories: ["invalidCategory"],
        });
        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
        expect(mockClient.release).toHaveBeenCalled();
    });

    it("should hash the password before storing", async () => {
        const password = "mySecurePassword";
        const hashedPassword = "hashed_password";

        vi.mocked(validateRegistrationModule.validateAllUserInput).mockReturnValue({
            valid: true,
            errors: [],
        });

        mockClient.query
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ rows: [], command: "", rowCount: 0, oid: 0, fields: [] })
            .mockResolvedValueOnce({
                rows: [
                    {
                        id: 1,
                        email: "test@example.com",
                        user_name: "TestUser",
                        current_location: null,
                        bio: null,
                        created_at: new Date(),
                    },
                ],
                command: "",
                rowCount: 1,
                oid: 0,
                fields: [],
            })
            .mockResolvedValueOnce(undefined);

        vi.mocked(hashPasswordModule.hashPassword).mockResolvedValue(hashedPassword);
        vi.mocked(generateTokenModule.generateToken).mockReturnValue("token");

        await request(app).post("/register").send({
            email: "test@example.com",
            password,
            userName: "TestUser",
        });

        expect(hashPasswordModule.hashPassword).toHaveBeenCalledWith(password);
        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO users"),
            expect.arrayContaining(["test@example.com", hashedPassword]),
        );
    });

    it("should rollback transaction on database error", async () => {
        vi.mocked(validateRegistrationModule.validateAllUserInput).mockReturnValue({
            valid: true,
            errors: [],
        });

        mockClient.query.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app).post("/register").send({
            email: "test@example.com",
            password: "password123",
            userName: "JohnDoe",
        });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Registration failed",
        });
        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
        expect(mockClient.release).toHaveBeenCalled();
    });

    it("should handle missing optional fields", async () => {
        const hashedPassword = "hashed_password_123";
        const token = "jwt_token_123";
        const newUser = {
            id: 1,
            email: "new@example.com",
            user_name: null,
            current_location: null,
            bio: null,
            created_at: new Date("2024-01-01").toString(),
        };

        vi.mocked(validateRegistrationModule.validateAllUserInput).mockReturnValue({
            valid: true,
            errors: [],
        });

        mockClient.query
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ rows: [], command: "", rowCount: 0, oid: 0, fields: [] })
            .mockResolvedValueOnce({ rows: [newUser], command: "", rowCount: 1, oid: 0, fields: [] })
            .mockResolvedValueOnce(undefined);

        vi.mocked(hashPasswordModule.hashPassword).mockResolvedValue(hashedPassword);
        vi.mocked(generateTokenModule.generateToken).mockReturnValue(token);

        const response = await request(app).post("/register").send({
            email: "new@example.com",
            password: "password123",
        });

        expect(response.status).toBe(201);
        expect(response.body.user).toEqual({
            id: newUser.id,
            email: newUser.email,
            userName: null,
            currentLocation: null,
            bio: null,
            categories: [],
            createdAt: newUser.created_at,
        });
    });
});
