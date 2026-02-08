import dotenv from "dotenv";
import express from "express";
import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";
import profileRouter from "./routes/profile.js";
import editRouter from "./routes/edit.js";
import categoryRouter from "./routes/category.js";
import { pool } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Netro API is running! 🚀");
});

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
        });
    }
});

app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/profile", profileRouter);
app.use("/edit", editRouter);
app.use("/category", categoryRouter);

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
