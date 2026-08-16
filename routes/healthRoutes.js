import { Router } from "express";
import mongoose   from "mongoose";

const router = Router();

/**
 * GET /api/health
 * Quick liveness + DB connectivity check.
 * Useful for load-balancer health probes and CI smoke tests.
 */
router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  //  0 = disconnected | 1 = connected | 2 = connecting | 3 = disconnecting
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState] ?? "unknown";

  const healthy = dbState === 1;

  res.status(healthy ? 200 : 503).json({
    success : healthy,
    message : healthy ? "Server is healthy" : "Database not connected",
    server  : "School Fee Management API",
    database: dbStatus,
    env     : process.env.NODE_ENV,
    uptime  : `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

export default router;
