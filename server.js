import "dotenv/config";      // loads .env before anything else
import app       from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// ── Boot sequence ─────────────────────────────────────────────────────────────

(async () => {
  // 1. Connect to MongoDB first — refuse to start without a DB
  await connectDB();

  // 2. Start the HTTP server
  const server = app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
  });

  // ── Graceful Shutdown ───────────────────────────────────────────────────────
  // Allows in-flight requests to complete before closing the process.

  const shutdown = (signal) => {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully…`);
    server.close(() => {
      console.log("✅ HTTP server closed.");
      process.exit(0);
    });

    // Force-close after 10 s if still hanging
    setTimeout(() => {
      console.error("❌ Forced shutdown after timeout.");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

  // Unhandled promise rejections — log and exit (let the process manager restart)
  process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Promise Rejection:", reason);
    shutdown("unhandledRejection");
  });
})();
