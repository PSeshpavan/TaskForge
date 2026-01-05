import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  console.log("[healthRouter] GET /health start");
  const payload = { ok: true, service: "taskforge-api", time: new Date().toISOString() };
  console.log("[healthRouter] GET /health success", payload);
  res.json(payload);
});
