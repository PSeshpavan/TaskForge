import type { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { findByEmail, verifyPassword } from "./auth.service";

/**
 * Initialize passport local strategy using User service.
 */
export function initPassport(passport: PassportStatic) {
  passport.use(
    new LocalStrategy({ usernameField: "email", passwordField: "password" }, async (email, password, done) => {
      try {
        const user = await findByEmail(email);
        if (!user) return done(null, false, { message: "Invalid credentials" });
        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return done(null, false, { message: "Invalid credentials" });
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    })
  );

  // No sessions: still provide no-op serialize/deserialize for completeness
  passport.serializeUser?.((user: any, done: any) => done(null, user));
  passport.deserializeUser?.((obj: any, done: any) => done(null, obj));
}