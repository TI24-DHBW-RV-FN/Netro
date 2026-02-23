import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const requiredEnvVars = ["POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB"];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`${envVar} environment variable is not set`);
    }
}

const host = process.env.POSTGRES_HOST || "localhost";
const port = process.env.POSTGRES_PORT || "5432";
const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${host}:${port}/${process.env.POSTGRES_DB}`;

export const pool = new Pool({
    connectionString,
});

pool.on("connect", () => {
    console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
    console.error("❌ Unexpected error on idle client", err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
