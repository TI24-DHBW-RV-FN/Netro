import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import eventRouter from "./event.js";
import { pool } from "../db.js";
import { authenticateToken } from "../token/authenticateToken.js";
import { ErrorMessages } from "../helpers/ErrorMessages.js";

const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
};

vi.mock("../db", () => ({
    pool: {
        query: vi.fn(),
        connect: vi.fn(),
    },
}));

vi.mock("../token/authenticateToken.js", () => ({
    authenticateToken: vi.fn((req, res, next) => {
        req.user = { userId: 1 };
        next();
    }),
}));

const app = express();
app.use(express.json());
app.use("/events", eventRouter);

const JWT_SECRET = "test-secret";

const generateToken = (userId: number) => {
    return jwt.sign({ userId, email: "test@example.com" }, JWT_SECRET, { expiresIn: "1h" });
};

describe("Event Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
        process.env.JWT_SECRET = JWT_SECRET;
        vi.mocked(pool.connect).mockResolvedValue(mockClient as any);
        mockClient.query.mockResolvedValue({ rows: [] });
        mockClient.release.mockReturnValue(undefined);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /events/create", () => {
        const token = generateToken(1);

        it("should successfully create an event without categories", async () => {
            const mockEvent = {
                id: 1,
                title: "Team Meeting",
                description: "Weekly team sync",
                start_time: new Date("2026-03-01T10:00:00Z"),
                location: "Conference Room A",
                series_event: false,
                frequency: null,
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] } as any) // User check
                .mockResolvedValueOnce({ rows: [] } as any) // BEGIN
                .mockResolvedValueOnce({ rows: [mockEvent] } as any) // INSERT event
                .mockResolvedValueOnce({ rows: [] } as any); // COMMIT

            const response = await request(app).post("/events/create").set("Authorization", `Bearer ${token}`).send({
                title: "Team Meeting",
                description: "Weekly team sync",
                startTime: "2026-03-01T10:00:00Z",
                location: "Conference Room A",
            });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Event created successfully");
            expect(response.body.event).toHaveProperty("id", 1);
            expect(response.body.event).toHaveProperty("title", "Team Meeting");
            expect(response.body.event.categories).toEqual([]);
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should successfully create a series event with frequency", async () => {
            const mockEvent = {
                id: 2,
                title: "Daily Standup",
                description: "Daily team standup",
                start_time: new Date("2026-03-01T09:00:00Z"),
                location: "Zoom",
                series_event: true,
                frequency: "daily",
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] } as any) // User check
                .mockResolvedValueOnce({ rows: [] } as any) // BEGIN
                .mockResolvedValueOnce({ rows: [mockEvent] } as any) // INSERT event
                .mockResolvedValueOnce({ rows: [] } as any); // COMMIT

            const response = await request(app).post("/events/create").set("Authorization", `Bearer ${token}`).send({
                title: "Daily Standup",
                description: "Daily team standup",
                startTime: "2026-03-01T09:00:00Z",
                location: "Zoom",
                seriesEvent: true,
                frequency: "daily",
            });

            expect(response.status).toBe(201);
            expect(response.body.event.seriesEvent).toBe(true);
            expect(response.body.event.frequency).toBe("daily");
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should successfully create an event with valid categories", async () => {
            const mockEvent = {
                id: 3,
                title: "Basketball Game",
                description: "Weekly basketball",
                start_time: new Date("2026-03-01T18:00:00Z"),
                location: "Sports Center",
                series_event: false,
                frequency: null,
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] } as any) // User check
                .mockResolvedValueOnce({ rows: [] } as any) // BEGIN
                .mockResolvedValueOnce({ rows: [mockEvent] } as any) // INSERT event
                .mockResolvedValueOnce({
                    rows: [
                        { id: 1, name: "football" },
                        { id: 2, name: "basketball" },
                    ],
                } as any) // Category validation
                .mockResolvedValueOnce({ rows: [] } as any) // INSERT categories
                .mockResolvedValueOnce({ rows: [] } as any); // COMMIT

            const response = await request(app)
                .post("/events/create")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Basketball Game",
                    description: "Weekly basketball",
                    startTime: "2026-03-01T18:00:00Z",
                    location: "Sports Center",
                    categories: ["football", "basketball"],
                });

            expect(response.status).toBe(201);
            expect(response.body.event.categories).toEqual(["football", "basketball"]);
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should return 400 if title is missing", async () => {
            const response = await request(app).post("/events/create").set("Authorization", `Bearer ${token}`).send({
                description: "Test description",
                startTime: "2026-03-01T10:00:00Z",
                location: "Test location",
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain("Title is required");
        });

        it("should return 400 if description is missing", async () => {
            const response = await request(app).post("/events/create").set("Authorization", `Bearer ${token}`).send({
                title: "Test Event",
                startTime: "2026-03-01T10:00:00Z",
                location: "Test location",
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain("Description is required");
        });

        it("should return 400 if startTime is missing", async () => {
            const response = await request(app).post("/events/create").set("Authorization", `Bearer ${token}`).send({
                title: "Test Event",
                description: "Test description",
                location: "Test location",
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain("Start time is required");
        });

        it("should return 400 if location is missing", async () => {
            const response = await request(app).post("/events/create").set("Authorization", `Bearer ${token}`).send({
                title: "Test Event",
                description: "Test description",
                startTime: "2026-03-01T10:00:00Z",
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain("Location is required");
        });

        it("should return 400 for invalid start time format", async () => {
            const response = await request(app).post("/events/create").set("Authorization", `Bearer ${token}`).send({
                title: "Test Event",
                description: "Test description",
                startTime: "invalid-date",
                location: "Test location",
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain("Invalid start time format");
        });

        it("should return 404 if user not found", async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] } as any); // User check returns empty

            const response = await request(app).post("/events/create").set("Authorization", `Bearer ${token}`).send({
                title: "Test Event",
                description: "Test description",
                startTime: "2026-03-01T10:00:00Z",
                location: "Test location",
            });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("User not found");
        });

        it("should return 400 and rollback if invalid categories provided", async () => {
            const mockEvent = {
                id: 4,
                title: "Test Event",
                description: "Test description",
                start_time: new Date("2026-03-01T10:00:00Z"),
                location: "Test location",
                series_event: false,
                frequency: null,
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] } as any) // User check
                .mockResolvedValueOnce({ rows: [] } as any) // BEGIN
                .mockResolvedValueOnce({ rows: [mockEvent] } as any) // INSERT event
                .mockResolvedValueOnce({
                    rows: [{ id: 1, name: "sports" }],
                } as any) // Only one valid category
                .mockResolvedValueOnce({ rows: [] } as any); // ROLLBACK

            const response = await request(app)
                .post("/events/create")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Test Event",
                    description: "Test description",
                    startTime: "2026-03-01T10:00:00Z",
                    location: "Test location",
                    categories: ["sports", "invalid-category"],
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid categories provided");
            expect(response.body.invalidCategories).toContain("invalid-category");
            expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should return 500 on database error", async () => {
            mockClient.query.mockRejectedValueOnce(new Error("Database error")); // User check throws

            const response = await request(app).post("/events/create").set("Authorization", `Bearer ${token}`).send({
                title: "Test Event",
                description: "Test description",
                startTime: "2026-03-01T10:00:00Z",
                location: "Test location",
            });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe("Failed to create event");
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    describe("PUT /events/edit", () => {
        const token = generateToken(1);

        it("should successfully update an event with all fields", async () => {
            const mockEvent = {
                id: 1,
                title: "Updated Event",
                description: "Updated description",
                start_time: new Date("2026-03-15T10:00:00Z"),
                location: "New Location",
                series_event: true,
                frequency: "weekly",
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1, created_by_user_id: 1 }] } as any) // Event check
                .mockResolvedValueOnce({ rows: [] } as any) // BEGIN
                .mockResolvedValueOnce({ rows: [mockEvent] } as any) // Update event
                .mockResolvedValueOnce({ rows: [] } as any) // Delete categories
                .mockResolvedValueOnce({ rows: [{ id: 1, name: "sports" }] } as any) // Category validation
                .mockResolvedValueOnce({ rows: [] } as any) // Insert category
                .mockResolvedValueOnce({ rows: [] } as any); // COMMIT

            const response = await request(app)
                .put("/events/edit")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    eventId: 1,
                    title: "Updated Event",
                    description: "Updated description",
                    startTime: "2026-03-15T10:00:00Z",
                    location: "New Location",
                    seriesEvent: true,
                    frequency: "weekly",
                    categories: ["sports"],
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Event updated successfully");
            expect(response.body.event.title).toBe("Updated Event");
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should successfully update only the title", async () => {
            const mockEvent = {
                id: 1,
                title: "New Title",
                description: "Original description",
                start_time: new Date("2026-03-01T10:00:00Z"),
                location: "Original Location",
                series_event: false,
                frequency: null,
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1, created_by_user_id: 1 }] } as any) // Event check
                .mockResolvedValueOnce({ rows: [] } as any) // BEGIN
                .mockResolvedValueOnce({ rows: [mockEvent] } as any) // Update event
                .mockResolvedValueOnce({ rows: [{ name: "sports" }] } as any) // Get existing categories
                .mockResolvedValueOnce({ rows: [] } as any); // COMMIT

            const response = await request(app).put("/events/edit").set("Authorization", `Bearer ${token}`).send({
                eventId: 1,
                title: "New Title",
            });

            expect(response.status).toBe(200);
            expect(response.body.event.title).toBe("New Title");
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should return 400 if eventId is missing", async () => {
            const response = await request(app).put("/events/edit").set("Authorization", `Bearer ${token}`).send({
                title: "New Title",
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain("Event ID is required");
        });

        it("should return 404 if event not found", async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] } as any);

            const response = await request(app).put("/events/edit").set("Authorization", `Bearer ${token}`).send({
                eventId: 999,
                title: "New Title",
            });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe(ErrorMessages.EVENT_NOT_FOUND);
        });

        it("should return 403 if user does not own the event", async () => {
            mockClient.query.mockResolvedValueOnce({
                rows: [{ id: 1, created_by_user_id: 999 }],
            } as any);

            const response = await request(app).put("/events/edit").set("Authorization", `Bearer ${token}`).send({
                eventId: 1,
                title: "New Title",
            });

            expect(response.status).toBe(403);
            expect(response.body.message).toBe(ErrorMessages.NO_PERMISSION_EDIT_EVENT);
        });

        it("should return 400 if no fields provided to update", async () => {
            mockClient.query.mockResolvedValueOnce({
                rows: [{ id: 1, created_by_user_id: 1 }],
            } as any);

            const response = await request(app).put("/events/edit").set("Authorization", `Bearer ${token}`).send({
                eventId: 1,
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("At least one field must be provided to update");
        });

        it("should return 400 for invalid start time format", async () => {
            mockClient.query.mockResolvedValueOnce({
                rows: [{ id: 1, created_by_user_id: 1 }],
            } as any);

            const response = await request(app).put("/events/edit").set("Authorization", `Bearer ${token}`).send({
                eventId: 1,
                startTime: "invalid-date",
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain("Invalid start time format");
        });

        it("should set frequency to null when seriesEvent is set to false", async () => {
            const mockEvent = {
                id: 1,
                title: "Event",
                description: "Description",
                start_time: new Date("2026-03-01T10:00:00Z"),
                location: "Location",
                series_event: false,
                frequency: null,
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1, created_by_user_id: 1 }] } as any) // Event check
                .mockResolvedValueOnce({ rows: [] } as any) // BEGIN
                .mockResolvedValueOnce({ rows: [mockEvent] } as any) // Update event
                .mockResolvedValueOnce({ rows: [] } as any) // Get existing categories
                .mockResolvedValueOnce({ rows: [] } as any); // COMMIT

            const response = await request(app).put("/events/edit").set("Authorization", `Bearer ${token}`).send({
                eventId: 1,
                seriesEvent: false,
            });

            expect(response.status).toBe(200);
            expect(response.body.event.seriesEvent).toBe(false);
            expect(response.body.event.frequency).toBeNull();
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should update categories successfully", async () => {
            const mockEvent = {
                id: 1,
                title: "Event",
                description: "Description",
                start_time: new Date("2026-03-01T10:00:00Z"),
                location: "Location",
                series_event: false,
                frequency: null,
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1, created_by_user_id: 1 }] } as any) // Event check
                .mockResolvedValueOnce({ rows: [] } as any) // BEGIN
                .mockResolvedValueOnce({ rows: [mockEvent] } as any) // Select event
                .mockResolvedValueOnce({ rows: [] } as any) // Delete categories
                .mockResolvedValueOnce({
                    rows: [
                        { id: 1, name: "sports" },
                        { id: 2, name: "outdoor" },
                    ],
                } as any) // Category validation
                .mockResolvedValueOnce({ rows: [] } as any) // Insert categories
                .mockResolvedValueOnce({ rows: [] } as any); // COMMIT

            const response = await request(app)
                .put("/events/edit")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    eventId: 1,
                    categories: ["sports", "outdoor"],
                });

            expect(response.status).toBe(200);
            expect(response.body.event.categories).toEqual(["sports", "outdoor"]);
        });

        it("should remove all categories when empty array provided", async () => {
            const mockEvent = {
                id: 1,
                title: "Event",
                description: "Description",
                start_time: new Date("2026-03-01T10:00:00Z"),
                location: "Location",
                series_event: false,
                frequency: null,
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1, created_by_user_id: 1 }] } as any) // Event check
                .mockResolvedValueOnce({ rows: [] } as any) // BEGIN
                .mockResolvedValueOnce({ rows: [mockEvent] } as any) // Select event
                .mockResolvedValueOnce({ rows: [] } as any) // Delete categories
                .mockResolvedValueOnce({ rows: [] } as any); // COMMIT

            const response = await request(app).put("/events/edit").set("Authorization", `Bearer ${token}`).send({
                eventId: 1,
                categories: [],
            });

            expect(response.status).toBe(200);
            expect(response.body.event.categories).toEqual([]);
        });

        it("should return 400 if categories is not an array", async () => {
            mockClient.query.mockResolvedValueOnce({
                rows: [{ id: 1, created_by_user_id: 1 }],
            } as any);

            const response = await request(app).put("/events/edit").set("Authorization", `Bearer ${token}`).send({
                eventId: 1,
                categories: "not-an-array",
            });

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain("Categories must be an array");
        });

        it("should return 400 if invalid categories provided and rollback", async () => {
            const mockEvent = {
                id: 1,
                title: "Event",
                description: "Description",
                start_time: new Date("2026-03-01T10:00:00Z"),
                location: "Location",
                series_event: false,
                frequency: null,
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            mockClient.query
                .mockResolvedValueOnce({ rows: [{ id: 1, created_by_user_id: 1 }] } as any) // Event check
                .mockResolvedValueOnce({ rows: [] } as any) // BEGIN
                .mockResolvedValueOnce({ rows: [mockEvent] } as any) // Select event
                .mockResolvedValueOnce({ rows: [] } as any) // Delete categories
                .mockResolvedValueOnce({ rows: [{ id: 1, name: "sports" }] } as any) // Only one valid category
                .mockResolvedValueOnce({ rows: [] } as any); // ROLLBACK

            const response = await request(app)
                .put("/events/edit")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    eventId: 1,
                    categories: ["sports", "invalid-category"],
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid categories provided");
            expect(response.body.invalidCategories).toContain("invalid-category");
            expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("should return 500 on database error and rollback", async () => {
            mockClient.query.mockRejectedValueOnce(new Error("Database error"));

            const response = await request(app).put("/events/edit").set("Authorization", `Bearer ${token}`).send({
                eventId: 1,
                title: "New Title",
            });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe(ErrorMessages.EVENT_UPDATE_FAILED);
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    describe("POST /events/info", () => {
        const token = generateToken(1);

        it("should successfully return event info with categories", async () => {
            const mockEvent = {
                id: 1,
                title: "Basketball Game",
                description: "Weekly basketball",
                start_time: new Date("2026-03-01T18:00:00Z"),
                location: "Sports Center",
                series_event: true,
                frequency: "weekly",
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockEvent] } as any)
                .mockResolvedValueOnce({
                    rows: [{ name: "basketball" }, { name: "football" }],
                } as any);

            const response = await request(app).post("/events/info").set("Authorization", `Bearer ${token}`).send({ eventId: 1 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Event retrieved successfully");
            expect(response.body.event).toHaveProperty("id", 1);
            expect(response.body.event).toHaveProperty("title", "Basketball Game");
            expect(response.body.event).toHaveProperty("seriesEvent", true);
            expect(response.body.event).toHaveProperty("frequency", "weekly");
            expect(response.body.event.categories).toEqual(["basketball", "football"]);
            expect(pool.query).toHaveBeenCalledTimes(2);
        });

        it("should successfully return event info with no categories", async () => {
            const mockEvent = {
                id: 2,
                title: "Team Meeting",
                description: "Weekly sync",
                start_time: new Date("2026-03-01T10:00:00Z"),
                location: "Conference Room A",
                series_event: false,
                frequency: null,
                created_at: new Date(),
                updated_at: new Date(),
                created_by_user_id: 1,
            };

            vi.mocked(pool.query)
                .mockResolvedValueOnce({ rows: [mockEvent] } as any)
                .mockResolvedValueOnce({ rows: [] } as any);

            const response = await request(app).post("/events/info").set("Authorization", `Bearer ${token}`).send({ eventId: 2 });

            expect(response.status).toBe(200);
            expect(response.body.event.categories).toEqual([]);
            expect(response.body.event.frequency).toBeNull();
            expect(response.body.event.seriesEvent).toBe(false);
        });

        it("should return 400 if eventId is missing", async () => {
            const response = await request(app).post("/events/info").set("Authorization", `Bearer ${token}`).send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain("Event ID is required");
        });

        it("should return 404 if event not found", async () => {
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);

            const response = await request(app).post("/events/info").set("Authorization", `Bearer ${token}`).send({ eventId: 999 });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(ErrorMessages.EVENT_NOT_FOUND);
        });

        it("should return 500 on database error", async () => {
            vi.mocked(pool.query).mockRejectedValueOnce(new Error("Database error"));

            const response = await request(app).post("/events/info").set("Authorization", `Bearer ${token}`).send({ eventId: 1 });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(ErrorMessages.EVENT_FETCH_FAILED);
        });
    });
});
