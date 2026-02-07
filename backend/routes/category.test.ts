import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import categoryRouter from "./category.js";
import { pool } from "../db.js";

vi.mock("../db", () => ({
    pool: {
        query: vi.fn(),
    },
}));

vi.mock("../auth/authenticateToken", () => ({
    authenticateToken: (req: any, res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
app.use("/categories", categoryRouter);

describe("GET /categories", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return all categories sorted by name", async () => {
        const mockCategories = [
            { id: 1, name: "basketball", created_at: new Date("2024-01-01").toString() },
            { id: 2, name: "football", created_at: new Date("2024-01-02").toString() },
            { id: 3, name: "programming", created_at: new Date("2024-01-03").toString() },
        ];

        vi.mocked(pool.query).mockResolvedValueOnce({
            rows: mockCategories,
            command: "",
            rowCount: 3,
            oid: 0,
            fields: [],
        } as any);

        const response = await request(app).get("/categories");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            categories: mockCategories,
        });
    });

    it("should return empty array when no categories exist", async () => {
        vi.mocked(pool.query).mockResolvedValueOnce({
            rows: [],
            command: "",
            rowCount: 0,
            oid: 0,
            fields: [],
        } as any);

        const response = await request(app).get("/categories");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            categories: [],
        });
    });

    it("should call query with correct SQL", async () => {
        vi.mocked(pool.query).mockResolvedValueOnce({
            rows: [],
            command: "",
            rowCount: 0,
            oid: 0,
            fields: [],
        } as any);

        await request(app).get("/categories");

        expect(pool.query).toHaveBeenCalledWith("SELECT id, name, created_at FROM categories ORDER BY name ASC");
    });

    it("should return 500 on database error", async () => {
        vi.mocked(pool.query).mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app).get("/categories");

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: "Request failed",
        });
    });
});
