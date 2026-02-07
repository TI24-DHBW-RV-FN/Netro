export function validateAllUserInput(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!data.email || typeof data.email !== "string") {
        errors.push("Email is required and must be a string");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push("Email must be a valid email address");
    }

    if (!data.password || typeof data.password !== "string") {
        errors.push("Password is required and must be a string");
    } else if (data.password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    // Optional fields with type checking
    if (data.userName !== undefined && data.userName !== null) {
        if (typeof data.userName !== "string") {
            errors.push("userName must be a string");
        } else if (data.userName.length > 100) {
            errors.push("userName must not exceed 100 characters");
        }
    }

    if (data.currentLocation !== undefined && data.currentLocation !== null) {
        if (typeof data.currentLocation !== "string") {
            errors.push("currentLocation must be a string");
        } else if (data.currentLocation.length > 100) {
            errors.push("currentLocation must not exceed 100 characters");
        }
    }

    if (data.bio !== undefined && data.bio !== null) {
        if (typeof data.bio !== "string") {
            errors.push("bio must be a string");
        } else if (data.bio.length > 100) {
            errors.push("bio must not exceed 100 characters");
        }
    }

    if (data.categories !== undefined && data.categories !== null) {
        if (!Array.isArray(data.categories)) {
            errors.push("categories must be an array");
        } else if (!data.categories.every((c: any) => typeof c === "string")) {
            errors.push("all categories must be strings");
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
