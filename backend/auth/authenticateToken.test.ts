import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./authenticateToken.js";

describe("authenticateToken", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    const JWT_SECRET = process.env.JWT_TEST_SECRET || "test-secret";

    beforeEach(() => {
        process.env.JWT_SECRET = JWT_SECRET;

        mockRequest = {
            headers: {},
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        nextFunction = vi.fn();
    });

    it("should call next() with valid token", () => {
        const token = jwt.sign({ userId: 1, email: "test@example.com" }, JWT_SECRET, { expiresIn: "1d" });
        mockRequest.headers = {
            authorization: `Bearer ${token}`,
        };

        authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user).toEqual({
            userId: 1,
            email: "test@example.com",
            iat: expect.any(Number),
            exp: expect.any(Number),
        });
    });

    it("should return 401 if no token is provided", () => {
        mockRequest.headers = {};

        authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: "Access token is required",
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 if authorization header is missing Bearer", () => {
        const token = jwt.sign({ userId: 1, email: "test@example.com" }, JWT_SECRET);
        mockRequest.headers = {
            authorization: token,
        };

        authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: "Access token is required",
        });
    });

    it("should return 403 for invalid token", () => {
        mockRequest.headers = {
            authorization: "Bearer invalid-token",
        };

        authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid or expired token",
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 403 for expired token", () => {
        const expiredToken = jwt.sign({ userId: 1, email: "test@example.com" }, JWT_SECRET, { expiresIn: "-1s" });

        mockRequest.headers = {
            authorization: `Bearer ${expiredToken}`,
        };

        authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid or expired token",
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 403 for token signed with wrong secret", () => {
        const wrongSecret = "wrong-secret";
        const token = jwt.sign({ userId: 1, email: "test@example.com" }, wrongSecret);
        mockRequest.headers = {
            authorization: `Bearer ${token}`,
        };

        authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid or expired token",
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
