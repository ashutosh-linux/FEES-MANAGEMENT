import express from "express";
import cors from "cors";
import morgan from "morgan";

// Routes
import healthRoutes from "./routes/healthRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import feeStructureRoutes from "./routes/feeStructureRoutes.js";
import billRoutes from "./routes/billRoutes.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// ── Global Middleware ─────────────────────────────────────────────────────────

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── API Routes ────────────────────────────────────────────────────────────────

const API_PREFIX = "/api";

app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/students`, studentRoutes);
app.use(`${API_PREFIX}/fee-structures`, feeStructureRoutes);
app.use(`${API_PREFIX}/bills`, billRoutes);

// ── Root & Base API Handlers ──────────────────────────────────────────────────

app.get("/", (_, res) => {
  res.json({
    message: "School Fee Management API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// Responds directly when requests hit the base API prefix
app.get("/api", (_, res) => {
  res.json({
    success: true,
    message: "School Fee Management API is live and reachable",
    docs: "/api/health",
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler (must be LAST) ───────────────────────────────────────

app.use(errorHandler);

export default app;