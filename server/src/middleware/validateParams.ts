import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validateParams(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid parameters", details: result.error.issues });
    }
    req.params = result.data;
    next();
  };
}