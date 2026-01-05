import request from "supertest";
import { createApp } from "../app";

describe("GET /health", () => {
  it("returns ok", async () => {
    const app = createApp();
    const res = await request(app).get("/health").expect(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe("taskforge-api");
  });
});
