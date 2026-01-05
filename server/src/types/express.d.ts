import { IUser } from "../modules/auth/user.model";

declare global {
  namespace Express {
    interface Request {
      authPayload?: { sub: string };
      user?: Partial<IUser> | any;
    }
  }
}