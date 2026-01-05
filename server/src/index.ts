import { createApp } from "./app";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/db";

const app = createApp();
let server: ReturnType<typeof app.listen> | undefined;

async function start() {
  await connectDB();
  server = app.listen(env.PORT, () => {
    console.log(`✅ Server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down...");
  try {
    await disconnectDB();
  } catch {}
  server?.close(() => process.exit(0));
});
