import request from "supertest";
import { createApp } from "../../app"; // adjust path if needed

export function makeApp() {
  return createApp();
}

// ✅ This matches whatever your installed supertest returns (no type mismatch)
export type TestAgent = ReturnType<typeof request.agent>;

export function makeAgent(app = makeApp()): TestAgent {
  return request.agent(app);
}
