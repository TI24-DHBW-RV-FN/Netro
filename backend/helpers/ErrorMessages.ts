// Standardized error response structure
export interface ErrorResponse {
    success: false;
    message: string;
    errors?: string[];
    invalidCategories?: string[];
}

// Standard error messages
export const ErrorMessages = {
    // Authentication
    VALIDATION_FAILED: "Validation failed",
    USER_EXISTS: "User with this email already exists",
    INVALID_CREDENTIALS: "Invalid email or password",
    INVALID_EMAIL_FORMAT: "Invalid email format",
    EMAIL_PASSWORD_REQUIRED: "Email and password are required",
    TOKEN_REQUIRED: "Access token is required",
    TOKEN_INVALID: "Invalid or expired token",

    // Password
    PASSWORD_REQUIRED: "Old password and new password are required",
    PASSWORD_TOO_SHORT: "New password must be at least 8 characters long",
    PASSWORD_INCORRECT: "Current password is incorrect",

    // Email
    EMAIL_REQUIRED: "Old email and new email are required",
    EMAIL_INCORRECT: "Current email is incorrect",
    EMAIL_INVALID: "Invalid email format",

    // Profile
    NO_FIELDS_PROVIDED: "At least one field must be provided to update",
    USER_NOT_FOUND: "User not found",

    // Categories
    INVALID_CATEGORIES: "Invalid categories provided",

    // Verification
    VERIFICATION_TOKEN_REQUIRED: "Verification token is required",
    EMAIL_ALREADY_VERIFIED: "Email is already verified",
    NO_VERIFICATION_TOKEN: "No verification token found. Please request a new one.",
    INVALID_VERIFICATION_TOKEN: "Invalid verification token",
    VERIFICATION_TOKEN_EXPIRED: "Verification token has expired. Please request a new one.",

    // Event
    EVENT_NOT_FOUND: "Event not found",
    EVENT_CREATE_FAILED: "Failed to create event",
    EVENT_UPDATE_FAILED: "Failed to update event",
    EVENT_FETCH_FAILED: "Failed to retrieve event",
    NO_PERMISSION_EDIT_EVENT: "You do not have permission to edit this event",

    // Generic
    REGISTRATION_FAILED: "Registration failed",
    LOGIN_FAILED: "Login failed",
    PASSWORD_UPDATE_FAILED: "Failed to update password",
    EMAIL_UPDATE_FAILED: "Failed to update email",
    PROFILE_UPDATE_FAILED: "Failed to update profile",
    PROFILE_FETCH_FAILED: "Failed to fetch user profile",
    REQUEST_FAILED: "Request failed",
    VERIFICATION_FAILED: "Failed to verify email",
    VERIFICATION_CODE_SEND_FAILED: "Failed to send verification code",
} as const;

// Success messages
export const SuccessMessages = {
    REGISTRATION_SUCCESS: "Registration successful",
    LOGIN_SUCCESS: "Login successful",
    PASSWORD_UPDATED: "Password updated successfully",
    EMAIL_UPDATED: "Email updated successfully",
    PROFILE_UPDATED: "Profile updated successfully",
    EMAIL_VERIFIED: "Email verified successfully",
    VERIFICATION_CODE_SENT: "Verification code sent successfully. Please check your email.",
} as const;

// Helper function to send error response
export function sendError(res: any, statusCode: number, message: string, errors?: string[], invalidCategories?: string[]): void {
    const response: ErrorResponse = {
        success: false,
        message,
    };

    if (errors) {
        response.errors = errors;
    }

    if (invalidCategories) {
        response.invalidCategories = invalidCategories;
    }

    res.status(statusCode).json(response);
}

// Helper function to send success response
export function sendSuccess(res: any, statusCode: number, message: string, data?: any): void {
    const response: any = {
        success: true,
        message,
        ...data,
    };

    res.status(statusCode).json(response);
}
