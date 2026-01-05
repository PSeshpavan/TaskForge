import { Router } from "express";
import passport from "passport";
import { z } from "zod";
import { registerController, loginController, logoutController, meController } from "./auth.controller";
import { validateBody } from "../../middleware/validateBody";
import { registerSchema, loginSchema } from "./auth.validation";
import { requireAuth } from "../../middleware/requireAuth";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), registerController);

authRouter.post(
  "/login",
  validateBody(loginSchema),
  passport.authenticate("local", { session: false }),
  loginController
);

authRouter.post("/logout", logoutController);

authRouter.get("/me", requireAuth, meController);