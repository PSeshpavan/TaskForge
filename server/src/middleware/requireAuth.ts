import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

const COOKIE_NAME = "access_token";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // ✅ Debug: show what we received
    console.log("---- requireAuth ----");
    console.log("Origin:", req.headers.origin);
    console.log("Cookie header:", req.headers.cookie);
    console.log("req.cookies:", (req as any).cookies); // needs cookie-parser
    console.log("COOKIE_NAME:", COOKIE_NAME);

    const tokenFromCookies = (req as any).cookies?.[COOKIE_NAME];

    const tokenFromHeader =
      req.headers.cookie
        ?.split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${COOKIE_NAME}=`))
        ?.split("=")[1];

    const token = tokenFromCookies || tokenFromHeader;

    console.log("tokenFromCookies exists?", !!tokenFromCookies);
    console.log("tokenFromHeader exists?", !!tokenFromHeader);
    console.log("token length:", token?.length);

    if (!token) {
      console.log("❌ No token found -> 401");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = verifyJwt<{ sub: string }>(token);

    console.log("✅ JWT verified. sub =", payload.sub);

    (req as any).user = { id: payload.sub };
    (req as any).authPayload = payload;
    return next();
  } catch (err: any) {
    console.log("❌ JWT verify failed:", err?.message || err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
