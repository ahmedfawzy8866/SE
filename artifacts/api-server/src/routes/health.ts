import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Root /api — responds to the metasidecar preview-path probe and any direct hits
router.get("/", (_req, res) => {
  res.json({ status: "ok", service: "sierra-estates-api" });
});

// /api/healthz — used by the artifact startup health check (artifact.toml)
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
