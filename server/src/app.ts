import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { healthRouter } from "./routes/health.js";
import { appEnv } from "./config/env.js";
import { db } from "./db/client.js";
import { initializeSchema } from "./db/schema.js";

initializeSchema(db);

export const createApp = () => {
  const app = express();

  app.set("trust proxy", true);
  app.use(helmet());
  app.use(
    cors({
      origin: appEnv.nodeEnv === "development" ? [/localhost:\d+$/] : false
    })
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(morgan(appEnv.nodeEnv === "development" ? "dev" : "combined"));

  app.use("/api/health", healthRouter);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error", err);
    res.status(500).json({
      status: "error",
      message: "Unexpected server error"
    });
  });

  return app;
};
