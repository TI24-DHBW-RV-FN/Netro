import dotenv from "dotenv";
import express from "express";
import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";
import profileRouter from "./routes/profile.js";
import { pool } from "./db.js";

dotenv.config(); // Load environment variables FIRST

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
    res.send("Netro API is running! 🚀");
});

// Health check for database
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT NOW()");
        res.json({
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            status: "unhealthy",
            database: "disconnected",
            timestamp: new Date().toISOString(),
        });
    }
});

// Mount authentication routes
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/profile", profileRouter);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
