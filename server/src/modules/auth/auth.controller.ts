import { Request, Response, NextFunction } from "express";
import { createUser, safeUser } from "./auth.service";
import { setAuthCookie, clearAuthCookie } from "../../utils/cookies";
import { signJwt } from "../../utils/jwt";

export async function registerController(req: Request, res: Response, next: NextFunction) {
  console.log("[authController] registerController start");
  try {
    const { name, email, password } = req.body;
    const user = await createUser(name, email, password);
    const token = signJwt({ sub: user._id.toString() });
    setAuthCookie(res, token);
    console.log("[authController] registerController success", { userId: user._id.toString() });
    return res.status(201).json({ user: safeUser(user) });
  } catch (err) {
    console.error("[authController] registerController error", err);
    next(err);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  console.log("[authController] loginController start");
  try {
    // passport has attached user to req.user
    const user = req.user as any;
    if (!user) {
      console.error("[authController] loginController error", "passport did not attach a user");
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signJwt({ sub: user._id.toString() });
    setAuthCookie(res, token);
    console.log("[authController] loginController success", { userId: user._id.toString() });
    return res.json({ user: safeUser(user) });
  } catch (err) {
    console.error("[authController] loginController error", err);
    next(err);
  }
}

export async function logoutController(req: Request, res: Response) {
  console.log("[authController] logoutController start");
  clearAuthCookie(res);
  console.log("[authController] logoutController success");
  return res.json({ ok: true });
}

export async function meController(req: Request, res: Response) {
  console.log("[authController] meController start");
  const payload = (req as any).authPayload as { sub: string } | undefined;
  if (!payload) {
    console.error("[authController] meController error", "missing auth payload");
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = payload.sub;
  // Minimal user fetch to return safe user
  const { User } = await import("./user.model");
  const user = await User.findById(userId).exec();
  if (!user) {
    console.error("[authController] meController error", { userId });
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log("[authController] meController success", { userId });
  return res.json({ user: safeUser(user as any) });
}
