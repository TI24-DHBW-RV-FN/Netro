import jwt from "jsonwebtoken";

export function generateToken(userId: number, email: string, JWT_SECRET: string): string {
    return jwt.sign(
        {
            userId: userId,
            email: email,
        },
        JWT_SECRET,
        { expiresIn: "1d" },
    );
}
