// Field length limits — kept in sync with init.sql column definitions
export const EVENT_FIELD_LIMITS = {
    TITLE_MAX: 100,
    DESCRIPTION_MAX: 255,
    LOCATION_MAX: 100,
    FREQUENCY_MAX: 100,
} as const;

export interface EventInput {
    title?: unknown;
    description?: unknown;
    startTime?: unknown;
    location?: unknown;
    seriesEvent?: unknown;
    frequency?: unknown;
    categories?: unknown;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validates event input for both create and edit routes.
 *
 * - mode "create": title, description, startTime, and location are required.
 * - mode "edit":   all fields are optional — only present fields are validated.
 */
export function validateEventInput(input: EventInput, mode: "create" | "edit"): ValidationResult {
    const errors: string[] = [];

    // ── Required field presence (create only) ─────────────────────────────────
    if (mode === "create") {
        if (!input.title) errors.push("Title is required");
        if (!input.description) errors.push("Description is required");
        if (!input.startTime) errors.push("Start time is required");
        if (!input.location) errors.push("Location is required");

        // Return early — no point checking types/lengths on missing values
        if (errors.length > 0) return { valid: false, errors };
    }

    // ── title ─────────────────────────────────────────────────────────────────
    if (input.title !== undefined) {
        if (typeof input.title !== "string") {
            errors.push("Title must be a string");
        } else if (input.title.trim().length === 0) {
            errors.push("Title cannot be empty");
        } else if (input.title.length > EVENT_FIELD_LIMITS.TITLE_MAX) {
            errors.push(`Title must be ${EVENT_FIELD_LIMITS.TITLE_MAX} characters or fewer`);
        }
    }

    // ── description ───────────────────────────────────────────────────────────
    if (input.description !== undefined) {
        if (typeof input.description !== "string") {
            errors.push("Description must be a string");
        } else if (input.description.trim().length === 0) {
            errors.push("Description cannot be empty");
        } else if (input.description.length > EVENT_FIELD_LIMITS.DESCRIPTION_MAX) {
            errors.push(`Description must be ${EVENT_FIELD_LIMITS.DESCRIPTION_MAX} characters or fewer`);
        }
    }

    // ── startTime ─────────────────────────────────────────────────────────────
    if (input.startTime !== undefined) {
        if (typeof input.startTime !== "string") {
            errors.push("Start time must be a string");
        } else if (isNaN(new Date(input.startTime).getTime())) {
            errors.push("Invalid start time format");
        }
    }

    // ── location ──────────────────────────────────────────────────────────────
    if (input.location !== undefined) {
        if (typeof input.location !== "string") {
            errors.push("Location must be a string");
        } else if (input.location.trim().length === 0) {
            errors.push("Location cannot be empty");
        } else if (input.location.length > EVENT_FIELD_LIMITS.LOCATION_MAX) {
            errors.push(`Location must be ${EVENT_FIELD_LIMITS.LOCATION_MAX} characters or fewer`);
        }
    }

    // ── seriesEvent ───────────────────────────────────────────────────────────
    if (input.seriesEvent !== undefined && typeof input.seriesEvent !== "boolean") {
        errors.push("seriesEvent must be a boolean");
    }

    // ── frequency ─────────────────────────────────────────────────────────────
    if (input.frequency !== undefined && input.frequency !== null) {
        if (typeof input.frequency !== "string") {
            errors.push("Frequency must be a string");
        } else if (input.frequency.length > EVENT_FIELD_LIMITS.FREQUENCY_MAX) {
            errors.push(`Frequency must be ${EVENT_FIELD_LIMITS.FREQUENCY_MAX} characters or fewer`);
        }
    }

    // ── categories ────────────────────────────────────────────────────────────
    if (input.categories !== undefined) {
        if (!Array.isArray(input.categories)) {
            errors.push("Categories must be an array");
        } else if (input.categories.some((cat) => typeof cat !== "string")) {
            errors.push("Each category must be a string");
        }
    }

    return { valid: errors.length === 0, errors };
}
