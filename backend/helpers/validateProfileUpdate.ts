export function validateProfileUpdate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.email !== undefined) {
        errors.push("Email cannot be changed through this endpoint");
    }

    if (data.password !== undefined) {
        errors.push("Password cannot be changed through this endpoint");
    }

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
