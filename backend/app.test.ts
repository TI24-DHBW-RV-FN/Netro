import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "./app.js";
import { pool } from "./db.js";

vi.mock("./db", () => ({
    pool: {
        query: vi.fn(),
        connect: vi.fn(),
    },
}));

vi.mock("./helpers/validateAllUserInput", () => ({
    validateAllUserInput: vi.fn(() => ({
        valid: false,
        errors: ["Email and password are required"],
    })),
}));

describe("Express App", () => {
    it("should respond to root endpoint", async () => {
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({});
    });

    it("should respond to health check endpoint and return 503 when no database is up", async () => {
        vi.mocked(pool.query).mockRejectedValueOnce(new Error("Connection failed"));

        const response = await request(app).get("/health");
        expect(response.status).toBe(503);
        expect(response.body).toEqual({
            status: "unhealthy",
            database: "disconnected",
        });
    });

    it("should have register route mounted", async () => {
        const mockClient = {
            query: vi.fn(),
            release: vi.fn(),
        };
        vi.mocked(pool.connect).mockResolvedValueOnce(mockClient as any);

        const response = await request(app).post("/register").send({});

        expect(response.status).not.toBe(404);
        expect(response.status).toBe(400);
    });

    it("should have login route mounted", async () => {
        const response = await request(app).post("/login").send({});

        expect(response.status).not.toBe(404);
        expect(response.status).toBe(400);
    });

    it("should have profile route mounted", async () => {
        const response = await request(app).get("/profile");

        expect(response.status).not.toBe(404);
        expect(response.status).toBe(401);
    });
});
