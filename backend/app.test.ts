import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "./app.js";
import { pool } from "./db.js";

describe("Express App", () => {
    afterAll(async () => {
        await pool.end();
    });

    it("should respond to root endpoint", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Netro API is running");
    });

    it("should respond to health check endpoint and return 503 when no database is up", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("database");
        expect(response.body).toHaveProperty("timestamp");
    });

    it("should have register route mounted", async () => {
        const response = await request(app).post("/register").send({});

        expect(response.status).not.toBe(404);
    });

    it("should have login route mounted", async () => {
        const response = await request(app).post("/login").send({});

        expect(response.status).not.toBe(404);
    });

    it("should have profile route mounted", async () => {
        const response = await request(app).get("/profile");

        expect(response.status).not.toBe(404);
    });
});
