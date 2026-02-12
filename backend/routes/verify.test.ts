import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import router from "./verify.js";
import { pool } from "../db.js";
import * as sendVerificationEmailModule from "../email/sendVerificationEmail.js";

vi.mock("../db.js", () => ({
    pool: {
        connect: vi.fn(),
    },
}));

vi.mock("../token/authenticateToken.js", () => ({
    authenticateToken: (req: any, _res: any, next: any) => {
        req.user = { userId: "user-123" };
        next();
    },
}));

vi.mock("../email/sendVerificationEmail.js");

const app = express();
app.use(express.json());
app.use("/verify", router);

// --- Helpers ---

function mockUserRow(overrides = {}) {
    return {
        id: "user-123",
        email: "test@example.com",
        email_verified: false,
        verification_token: "123456",
        verification_token_expires: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        ...overrides,
    };
}

describe("POST /verify/email", () => {
    let mockClient: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockClient = {
            query: vi.fn(),
            release: vi.fn(),
        };

        vi.mocked(pool.connect).mockResolvedValue(mockClient);
    });

    /** Make mockQuery return the right things for BEGIN, SELECT, UPDATE, COMMIT */
    function setupQueryMock(userRow: object | null) {
        mockClient.query.mockImplementation((sql: string) => {
            if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") {
                return { rows: [] };
            }
            if (sql.startsWith("SELECT")) {
                return { rows: userRow ? [userRow] : [] };
            }
            if (sql.startsWith("UPDATE")) {
                return { rows: [], rowCount: 1 };
            }
            return { rows: [] };
        });
    }

    it("should verify email successfully with valid token", async () => {
        setupQueryMock(mockUserRow());

        const res = await request(app).post("/verify/email").send({ verificationToken: "123456" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            success: true,
            message: "Email verified successfully",
        });
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("should return 400 if verificationToken is missing", async () => {
        const res = await request(app).post("/verify/email").send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Verification token is required");
    });

    it("should return 404 if user not found", async () => {
        setupQueryMock(null);

        const res = await request(app).post("/verify/email").send({ verificationToken: "123456" });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("User not found");
    });

    it("should return 400 if email is already verified", async () => {
        setupQueryMock(mockUserRow({ email_verified: true }));

        const res = await request(app).post("/verify/email").send({ verificationToken: "123456" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Email is already verified");
    });

    it("should return 400 if no verification token exists on user", async () => {
        setupQueryMock(mockUserRow({ verification_token: null }));

        const res = await request(app).post("/verify/email").send({ verificationToken: "123456" });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("No verification token found");
    });

    it("should return 400 if token does not match", async () => {
        setupQueryMock(mockUserRow({ verification_token: "999999" }));

        const res = await request(app).post("/verify/email").send({ verificationToken: "123456" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid verification token");
    });

    it("should return 400 if token has expired", async () => {
        setupQueryMock(
            mockUserRow({
                verification_token_expires: new Date(Date.now() - 60 * 1000).toISOString(),
            }),
        );

        const res = await request(app).post("/verify/email").send({ verificationToken: "123456" });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("expired");
    });

    it("should return 500 and rollback on unexpected error", async () => {
        mockClient.query.mockImplementation((sql: string) => {
            if (sql === "BEGIN") return { rows: [] };
            if (sql === "ROLLBACK") return { rows: [] };
            if (sql.startsWith("SELECT")) throw new Error("DB crash");
            return { rows: [] };
        });

        const res = await request(app).post("/verify/email").send({ verificationToken: "123456" });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Failed to verify email");
        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
});

// =====================
// GET /verify/code
// =====================
describe("GET /verify/code", () => {
    let mockClient: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockClient = {
            query: vi.fn(),
            release: vi.fn(),
        };

        vi.mocked(pool.connect).mockResolvedValue(mockClient);
    });

    /** Make mockQuery return the right things for BEGIN, SELECT, UPDATE, COMMIT */
    function setupQueryMock(userRow: object | null) {
        mockClient.query.mockImplementation((sql: string) => {
            if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") {
                return { rows: [] };
            }
            if (sql.startsWith("SELECT")) {
                return { rows: userRow ? [userRow] : [] };
            }
            if (sql.startsWith("UPDATE")) {
                return { rows: [], rowCount: 1 };
            }
            return { rows: [] };
        });
    }

    it("should send a new verification code successfully", async () => {
        setupQueryMock(mockUserRow());
        vi.mocked(sendVerificationEmailModule.sendVerificationEmail).mockResolvedValue("654321");

        const res = await request(app).get("/verify/code");

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            success: true,
            message: expect.stringContaining("Verification code sent"),
            expiresIn: "5 minutes",
        });
        expect(sendVerificationEmailModule.sendVerificationEmail).toHaveBeenCalledWith("test@example.com");
        expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("should return 404 if user not found", async () => {
        setupQueryMock(null);

        const res = await request(app).get("/verify/code");

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("User not found");
    });

    it("should return 400 if email is already verified", async () => {
        setupQueryMock(mockUserRow({ email_verified: true }));

        const res = await request(app).get("/verify/code");

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Email is already verified");
    });

    it("should return 500 and rollback on unexpected error", async () => {
        mockClient.query.mockImplementation((sql: string) => {
            if (sql === "BEGIN") return { rows: [] };
            if (sql === "ROLLBACK") return { rows: [] };
            if (sql.startsWith("SELECT")) throw new Error("DB crash");
            return { rows: [] };
        });

        const res = await request(app).get("/verify/code");

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Failed to send verification code");
        expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should store the new verification code and expiration in the database", async () => {
        setupQueryMock(mockUserRow());
        vi.mocked(sendVerificationEmailModule.sendVerificationEmail).mockResolvedValue("654321");

        // Override to capture the UPDATE call args
        const updateCalls: any[] = [];
        mockClient.query.mockImplementation((sql: string, params?: any[]) => {
            if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") {
                return { rows: [] };
            }
            if (sql.startsWith("SELECT")) {
                return { rows: [mockUserRow()] };
            }
            if (sql.startsWith("UPDATE")) {
                updateCalls.push(params);
                return { rows: [], rowCount: 1 };
            }
            return { rows: [] };
        });

        await request(app).get("/verify/code");

        expect(updateCalls.length).toBe(1);
        expect(updateCalls[0][0]).toBe("654321"); // verification code
        expect(updateCalls[0][2]).toBe("user-123"); // userId
    });
});
