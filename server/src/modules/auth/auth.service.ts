import bcrypt from "bcryptjs";
import { User, IUser } from "./user.model";

const SALT_ROUNDS = 10;

export async function createUser(name: string, email: string, password: string): Promise<IUser> {
  const existing = await User.findOne({ email }).lean().exec();
  if (existing) throw Object.assign(new Error("Email already in use"), { status: 400 });
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = new User({ name, email, passwordHash: hash });
  return user.save();
}

export async function findByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email }).exec();
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function safeUser(user: IUser) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}