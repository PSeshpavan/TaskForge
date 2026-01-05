import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createApp } from "../../../app";
import { env } from "../../../config/env";
import { User } from "../user.model";

let mongod: MongoMemoryServer;
let app = createApp();

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  // recreate app after env changes
  app = createApp();
});

afterEach(async () => {
  const db = mongoose.connection.db;
  if (!db) return;
  const collections = await db.collections();
  for (const col of collections) {
    await col.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Auth flow", () => {
  test("register -> should 201 and set-cookie", async () => {
    const agent = request.agent(app);
    const res = await agent.post("/auth/register").send({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe("alice@example.com");
    const cookies = res.headers["set-cookie"];
    expect(
      cookies &&
        (Array.isArray(cookies)
          ? cookies.find((c: string) => c.includes("access_token"))
          : cookies.includes("access_token"))
    ).toBeTruthy();
    const users = await User.find({}).lean().exec();
    expect(users.length).toBe(1);
  });

  test("login -> should 200 and set-cookie", async () => {
    // create user
    await request(app).post("/auth/register").send({
      name: "Bob",
      email: "bob@example.com",
      password: "password123",
    });
    const agent = request.agent(app);
    const res = await agent.post("/auth/login").send({
      email: "bob@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("bob@example.com");
    const cookies = res.headers["set-cookie"];
    expect(
      cookies &&
        (Array.isArray(cookies)
          ? cookies.find((c: string) => c.includes("access_token"))
          : cookies.includes("access_token"))
    ).toBeTruthy();
  });

  test("me -> with cookie returns user", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/register").send({
      name: "Carol",
      email: "carol@example.com",
      password: "password123",
    });
    const me = await agent.get("/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe("carol@example.com");
    expect(me.body.user.name).toBe("Carol");
  });

  test("logout -> clears cookie", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/register").send({
      name: "Dan",
      email: "dan@example.com",
      password: "password123",
    });
    const res = await agent.post("/auth/logout").send();
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const cookies = res.headers["set-cookie"];
    // cookie cleared (max-age=0 or access_token=)
    expect(
      cookies &&
        (Array.isArray(cookies)
          ? cookies.find((c: string) => c.includes("access_token="))
          : cookies.includes("access_token="))
    ).toBeTruthy();
  });
});