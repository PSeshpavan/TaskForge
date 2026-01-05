import { Response } from "express";
import { env } from "../config/env";

const COOKIE_NAME = "access_token";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export function setAuthCookie(res: Response, token: string) {
  const isProd = env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    maxAge: MAX_AGE,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
}

export function clearAuthCookie(res: Response) {
  const isProd = env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
}