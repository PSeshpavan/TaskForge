import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI, {
      // use defaults; keep options minimal to avoid deprecation logs in modern mongoose
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    console.log("🔌 Disconnected MongoDB");
  } catch (err) {
    console.error("Error disconnecting MongoDB:", err);
    // don't rethrow on shutdown
  }
}