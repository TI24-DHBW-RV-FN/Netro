import { describe, it, expect } from "vitest";
import { validateEventInput, EVENT_FIELD_LIMITS } from "./validateEventInput.js";

const str = (len: number) => "a".repeat(len);

const validInput = () => ({
    title: "Basketball Game",
    description: "Friendly match at the park",
    startTime: "2026-03-15T18:00:00Z",
    location: "Central Park",
});

// ─────────────────────────────────────────────────────────────────────────────
// mode: "create"
// ─────────────────────────────────────────────────────────────────────────────

describe('validateEventInput — mode: "create"', () => {
    // ── Required field presence ───────────────────────────────────────────────

    describe("required fields", () => {
        it("should pass with all required fields", () => {
            const result = validateEventInput(validInput(), "create");
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should return all four errors when all required fields are missing", () => {
            const result = validateEventInput({}, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Title is required");
            expect(result.errors).toContain("Description is required");
            expect(result.errors).toContain("Start time is required");
            expect(result.errors).toContain("Location is required");
        });

        it("should fail when title is missing", () => {
            const result = validateEventInput({ ...validInput(), title: "" }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Title is required");
        });

        it("should fail when description is missing", () => {
            const result = validateEventInput({ ...validInput(), description: "" }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Description is required");
        });

        it("should fail when startTime is missing", () => {
            const result = validateEventInput({ ...validInput(), startTime: "" }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Start time is required");
        });

        it("should fail when location is missing", () => {
            const result = validateEventInput({ ...validInput(), location: "" }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Location is required");
        });

        it("should return early without type/length errors when required fields are missing", () => {
            // If required fields are absent we return early, so no type errors should appear
            const result = validateEventInput({}, "create");
            expect(result.errors.some((e) => e.includes("must be a string"))).toBe(false);
        });
    });

    // ── title ─────────────────────────────────────────────────────────────────

    describe("title", () => {
        it("should pass at exactly the max length", () => {
            const result = validateEventInput({ ...validInput(), title: str(EVENT_FIELD_LIMITS.TITLE_MAX) }, "create");
            expect(result.valid).toBe(true);
        });

        it("should fail when title exceeds max length", () => {
            const result = validateEventInput({ ...validInput(), title: str(EVENT_FIELD_LIMITS.TITLE_MAX + 1) }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(`Title must be ${EVENT_FIELD_LIMITS.TITLE_MAX} characters or fewer`);
        });

        it("should fail when title is not a string", () => {
            const result = validateEventInput({ ...validInput(), title: 123 }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Title must be a string");
        });

        it("should fail when title is only whitespace", () => {
            const result = validateEventInput({ ...validInput(), title: "   " }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Title cannot be empty");
        });
    });

    // ── description ───────────────────────────────────────────────────────────

    describe("description", () => {
        it("should pass at exactly the max length", () => {
            const result = validateEventInput({ ...validInput(), description: str(EVENT_FIELD_LIMITS.DESCRIPTION_MAX) }, "create");
            expect(result.valid).toBe(true);
        });

        it("should fail when description exceeds max length", () => {
            const result = validateEventInput({ ...validInput(), description: str(EVENT_FIELD_LIMITS.DESCRIPTION_MAX + 1) }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(`Description must be ${EVENT_FIELD_LIMITS.DESCRIPTION_MAX} characters or fewer`);
        });

        it("should fail when description is not a string", () => {
            const result = validateEventInput({ ...validInput(), description: true }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Description must be a string");
        });

        it("should fail when description is only whitespace", () => {
            const result = validateEventInput({ ...validInput(), description: "   " }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Description cannot be empty");
        });
    });

    // ── startTime ─────────────────────────────────────────────────────────────

    describe("startTime", () => {
        it("should pass with a valid ISO 8601 string", () => {
            const result = validateEventInput({ ...validInput(), startTime: "2026-06-01T00:00:00Z" }, "create");
            expect(result.valid).toBe(true);
        });

        it("should fail with an invalid date string", () => {
            const result = validateEventInput({ ...validInput(), startTime: "not-a-date" }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Invalid start time format");
        });

        it("should fail when startTime is not a string", () => {
            const result = validateEventInput({ ...validInput(), startTime: 1234567890 }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Start time must be a string");
        });
    });

    // ── location ──────────────────────────────────────────────────────────────

    describe("location", () => {
        it("should pass at exactly the max length", () => {
            const result = validateEventInput({ ...validInput(), location: str(EVENT_FIELD_LIMITS.LOCATION_MAX) }, "create");
            expect(result.valid).toBe(true);
        });

        it("should fail when location exceeds max length", () => {
            const result = validateEventInput({ ...validInput(), location: str(EVENT_FIELD_LIMITS.LOCATION_MAX + 1) }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(`Location must be ${EVENT_FIELD_LIMITS.LOCATION_MAX} characters or fewer`);
        });

        it("should fail when location is not a string", () => {
            const result = validateEventInput({ ...validInput(), location: [] }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Location must be a string");
        });

        it("should fail when location is only whitespace", () => {
            const result = validateEventInput({ ...validInput(), location: "   " }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Location cannot be empty");
        });
    });

    // ── seriesEvent ───────────────────────────────────────────────────────────

    describe("seriesEvent", () => {
        it("should pass when seriesEvent is true", () => {
            const result = validateEventInput({ ...validInput(), seriesEvent: true }, "create");
            expect(result.valid).toBe(true);
        });

        it("should pass when seriesEvent is false", () => {
            const result = validateEventInput({ ...validInput(), seriesEvent: false }, "create");
            expect(result.valid).toBe(true);
        });

        it("should pass when seriesEvent is omitted", () => {
            const result = validateEventInput(validInput(), "create");
            expect(result.valid).toBe(true);
        });

        it("should fail when seriesEvent is not a boolean", () => {
            const result = validateEventInput({ ...validInput(), seriesEvent: "true" }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("seriesEvent must be a boolean");
        });
    });

    // ── frequency ─────────────────────────────────────────────────────────────

    describe("frequency", () => {
        it("should pass with a valid frequency string", () => {
            const result = validateEventInput({ ...validInput(), seriesEvent: true, frequency: "weekly" }, "create");
            expect(result.valid).toBe(true);
        });

        it("should pass when frequency is null", () => {
            const result = validateEventInput({ ...validInput(), frequency: null }, "create");
            expect(result.valid).toBe(true);
        });

        it("should pass when frequency is omitted", () => {
            const result = validateEventInput(validInput(), "create");
            expect(result.valid).toBe(true);
        });

        it("should pass at exactly the max length", () => {
            const result = validateEventInput({ ...validInput(), frequency: str(EVENT_FIELD_LIMITS.FREQUENCY_MAX) }, "create");
            expect(result.valid).toBe(true);
        });

        it("should fail when frequency exceeds max length", () => {
            const result = validateEventInput({ ...validInput(), frequency: str(EVENT_FIELD_LIMITS.FREQUENCY_MAX + 1) }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(`Frequency must be ${EVENT_FIELD_LIMITS.FREQUENCY_MAX} characters or fewer`);
        });

        it("should fail when frequency is not a string", () => {
            const result = validateEventInput({ ...validInput(), frequency: 7 }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Frequency must be a string");
        });
    });

    // ── categories ────────────────────────────────────────────────────────────

    describe("categories", () => {
        it("should pass with a valid array of strings", () => {
            const result = validateEventInput({ ...validInput(), categories: ["basketball", "gaming"] }, "create");
            expect(result.valid).toBe(true);
        });

        it("should pass with an empty array", () => {
            const result = validateEventInput({ ...validInput(), categories: [] }, "create");
            expect(result.valid).toBe(true);
        });

        it("should pass when categories is omitted", () => {
            const result = validateEventInput(validInput(), "create");
            expect(result.valid).toBe(true);
        });

        it("should fail when categories is not an array", () => {
            const result = validateEventInput({ ...validInput(), categories: "basketball" }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Categories must be an array");
        });

        it("should fail when a category entry is not a string", () => {
            const result = validateEventInput({ ...validInput(), categories: ["basketball", 42] }, "create");
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Each category must be a string");
        });
    });

    // ── multiple errors ───────────────────────────────────────────────────────

    describe("multiple errors", () => {
        it("should accumulate multiple field errors", () => {
            const result = validateEventInput(
                {
                    title: str(EVENT_FIELD_LIMITS.TITLE_MAX + 1),
                    description: str(EVENT_FIELD_LIMITS.DESCRIPTION_MAX + 1),
                    startTime: "2026-03-15T18:00:00Z",
                    location: str(EVENT_FIELD_LIMITS.LOCATION_MAX + 1),
                    seriesEvent: "yes",
                },
                "create",
            );
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThanOrEqual(3);
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// mode: "edit"
// ─────────────────────────────────────────────────────────────────────────────

describe('validateEventInput — mode: "edit"', () => {
    it("should pass with no fields provided", () => {
        // The route itself rejects empty patches — the validator only checks field shape
        const result = validateEventInput({}, "edit");
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it("should pass with a single valid field", () => {
        const result = validateEventInput({ title: "New Title" }, "edit");
        expect(result.valid).toBe(true);
    });

    it("should only validate fields that are present", () => {
        // description absent — no description error should appear
        const result = validateEventInput({ title: "Valid Title" }, "edit");
        expect(result.valid).toBe(true);
        expect(result.errors.some((e) => e.toLowerCase().includes("description"))).toBe(false);
    });

    it("should fail when title exceeds max length", () => {
        const result = validateEventInput({ title: str(EVENT_FIELD_LIMITS.TITLE_MAX + 1) }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(`Title must be ${EVENT_FIELD_LIMITS.TITLE_MAX} characters or fewer`);
    });

    it("should fail when title is only whitespace", () => {
        const result = validateEventInput({ title: "   " }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Title cannot be empty");
    });

    it("should fail when description exceeds max length", () => {
        const result = validateEventInput({ description: str(EVENT_FIELD_LIMITS.DESCRIPTION_MAX + 1) }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(`Description must be ${EVENT_FIELD_LIMITS.DESCRIPTION_MAX} characters or fewer`);
    });

    it("should fail when description is only whitespace", () => {
        const result = validateEventInput({ description: "   " }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Description cannot be empty");
    });

    it("should fail with an invalid startTime", () => {
        const result = validateEventInput({ startTime: "not-a-date" }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Invalid start time format");
    });

    it("should pass with a valid startTime", () => {
        const result = validateEventInput({ startTime: "2026-03-15T18:00:00Z" }, "edit");
        expect(result.valid).toBe(true);
    });

    it("should fail when location exceeds max length", () => {
        const result = validateEventInput({ location: str(EVENT_FIELD_LIMITS.LOCATION_MAX + 1) }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(`Location must be ${EVENT_FIELD_LIMITS.LOCATION_MAX} characters or fewer`);
    });

    it("should fail when location is only whitespace", () => {
        const result = validateEventInput({ location: "   " }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Location cannot be empty");
    });

    it("should fail when seriesEvent is not a boolean", () => {
        const result = validateEventInput({ seriesEvent: 1 }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("seriesEvent must be a boolean");
    });

    it("should fail when frequency exceeds max length", () => {
        const result = validateEventInput({ frequency: str(EVENT_FIELD_LIMITS.FREQUENCY_MAX + 1) }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(`Frequency must be ${EVENT_FIELD_LIMITS.FREQUENCY_MAX} characters or fewer`);
    });

    it("should pass when frequency is null (clearing it)", () => {
        const result = validateEventInput({ frequency: null }, "edit");
        expect(result.valid).toBe(true);
    });

    it("should fail when categories is not an array", () => {
        const result = validateEventInput({ categories: "basketball" }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Categories must be an array");
    });

    it("should fail when a category entry is not a string", () => {
        const result = validateEventInput({ categories: [123] }, "edit");
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Each category must be a string");
    });

    it("should pass with an empty categories array", () => {
        const result = validateEventInput({ categories: [] }, "edit");
        expect(result.valid).toBe(true);
    });

    it("should accumulate multiple field errors", () => {
        const result = validateEventInput(
            {
                title: str(EVENT_FIELD_LIMITS.TITLE_MAX + 1),
                location: str(EVENT_FIELD_LIMITS.LOCATION_MAX + 1),
                seriesEvent: "false",
            },
            "edit",
        );
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
});
