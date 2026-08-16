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

const defaultDevOrigins = ["http://localhost:5173"];
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const wildcardAllowed = configuredOrigins.includes("*");
const allowAllOrigins = wildcardAllowed || process.env.NODE_ENV === "production";

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? configuredOrigins
    : [...new Set([...defaultDevOrigins, ...configuredOrigins])];

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests and tools like curl/postman with no Origin header.
      if (!origin) return callback(null, true);
      if (allowAllOrigins) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));           // body parser + payload cap
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// HTTP request logger — "dev" in development, "combined" (Apache format) in prod
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── API Routes ────────────────────────────────────────────────────────────────

const API_PREFIX = "/api";

app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/students`, studentRoutes);
app.use(`${API_PREFIX}/fee-structures`, feeStructureRoutes);
app.use(`${API_PREFIX}/bills`, billRoutes);

// ── Root ──────────────────────────────────────────────────────────────────────

app.get("/", (_, res) => {
  res.json({
    message: "School Fee Management API",
    version: "1.0.0",
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
