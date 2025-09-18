import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "PermitPass API healthy",
    timestamp: new Date().toISOString()
  });
});
