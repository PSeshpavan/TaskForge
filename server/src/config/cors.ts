import type { CorsOptions } from "cors";

export function buildCorsOptions(): CorsOptions {
  const origin = process.env.CLIENT_ORIGIN;

  return {
    origin: origin ? [origin] : true,
    credentials: true
  };
}
