import jwt from "jsonwebtoken";
import { env } from "../config/env";

function getJwtSecret(): string {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return env.JWT_SECRET;
}

export function signJwt(payload: object) {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyJwt<T extends object>(token: string): T {
  const secret = getJwtSecret();
  return jwt.verify(token, secret) as T;
}