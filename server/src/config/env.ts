import { z } from "zod";
import "dotenv/config";

const schema = z
  .object({
    PORT: z.coerce.number().int().positive().default(4000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // CLIENT_ORIGIN: z.string().nonempty({ message: "CLIENT_ORIGIN is required" }),
    CLIENT_ORIGIN: z.string().optional(),
    MONGO_URI: z.string().nonempty({ message: "MONGO_URI is required" }),
    JWT_SECRET: z.string().optional(),
  })
  .refine(
    // (data) => !!data.JWT_SECRET || data.NODE_ENV === "test",
    // { message: "JWT_SECRET is required unless NODE_ENV=test", path: ["JWT_SECRET"] }
    (data) => data.NODE_ENV !== "production" || !!data.CLIENT_ORIGIN,
    { message: "CLIENT_ORIGIN is required in production", path: ["CLIENT_ORIGIN"] }
  );

const result = schema.safeParse(process.env);
if (!result.success) {
  // Provide human-readable error and fail fast
  console.error("❌ Invalid environment variables:\n", result.error.format());
  throw new Error("Invalid environment variables: " + result.error.message);
}

export const env = result.data;
export type Env = typeof env;