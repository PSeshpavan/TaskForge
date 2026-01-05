import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Validation Error", details: err.issues });
  }

  const status = err?.status || 500;
  const payload: Record<string, any> = { message: err?.message || "Internal Server Error" };

  if (process.env.NODE_ENV !== "production" && err?.stack) {
    payload.stack = err.stack;
  }

  if (err?.details) payload.details = err.details;

  res.status(status).json(payload);
}