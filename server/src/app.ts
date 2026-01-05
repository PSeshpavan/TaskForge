import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { buildCorsOptions } from "./config/cors";
import { healthRouter } from "./modules/health/health.routes";
import { initPassport } from "./modules/auth/passport";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { boardsRouter } from "./modules/boards/boards.routes";
import { tasksRouter } from "./modules/tasks/tasks.routes";

export function createApp() {
  const app = express();

  app.use(cors(buildCorsOptions()));
  app.use(express.json());
  app.use(cookieParser());

  // Initialize passport (no sessions)
  initPassport(passport);
  app.use(passport.initialize());

  app.use("/health", healthRouter);

  // auth routes
  app.use("/auth", authRouter);

  // boards + activity under /boards
  app.use("/boards", boardsRouter);

  // tasks routes (include endpoints under /boards/:boardId/tasks and /tasks/:taskId)
  app.use(tasksRouter);

  // 404 for unmatched routes
  app.use(notFound);

  // Central error handler (last)
  app.use(errorHandler);

  return app;
}
