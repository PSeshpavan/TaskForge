import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createApp } from "../../../app";
import { User } from "../../auth/user.model";
import { BoardMember } from "../member.model";
import { Activity } from "../../activity/activity.model";

let mongod: MongoMemoryServer;
let app = createApp();

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
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

async function registerAgent(name: string, email: string) {
  const agent = request.agent(app);
  await agent.post("/auth/register").send({ name, email, password: "password123" });
  return agent;
}

describe("Boards module", () => {
  test("create board -> 201 and membership OWNER", async () => {
    const agent = await registerAgent("Owner", "owner@example.com");
    const res = await agent.post("/boards").send({ name: "My Board" });
    expect(res.status).toBe(201);
    expect(res.body.board).toBeDefined();
    const boardId = res.body.board.id;
    const members = await BoardMember.find({ boardId }).lean().exec();
    expect(members.length).toBe(1);
    expect(members[0].role).toBe("OWNER");
  });

  test("list boards includes created board", async () => {
    const agent = await registerAgent("Lister", "lister@example.com");
    await agent.post("/boards").send({ name: "Board A" });
    const res = await agent.get("/boards");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.boards)).toBe(true);
    expect(res.body.boards.length).toBe(1);
  });

  test("member cannot PATCH board name (403)", async () => {
    const owner = await registerAgent("Owner2", "owner2@example.com");
    const createRes = await owner.post("/boards").send({ name: "Secret" });
    const boardId = createRes.body.board.id;

    // add a member
    const ownerAdd = owner; // same agent
    await ownerAdd.post(`/boards/${boardId}/members`).send({ email: "member@example.com" });
    // register the member (so user exists)
    const memberAgent = await registerAgent("Member", "member@example.com");

    // member attempts to patch
    const res = await memberAgent.patch(`/boards/${boardId}`).send({ name: "Hacked" });
    expect(res.status).toBe(403);
  });

  test("owner can add member by email (200/201) and activity logged", async () => {
    const ownerAgent = await registerAgent("Owner3", "owner3@example.com");
    // create target user but not a member yet
    await request(app).post("/auth/register").send({ name: "NewMember", email: "newmember@example.com", password: "password123" });
    const createRes = await ownerAgent.post("/boards").send({ name: "Team Board" });
    const boardId = createRes.body.board.id;
    const addRes = await ownerAgent.post(`/boards/${boardId}/members`).send({ email: "newmember@example.com" });
    expect(addRes.status).toBe(200);
    expect(addRes.body.member).toBeDefined();
    const activities = await Activity.find({ boardId }).sort({ createdAt: -1 }).lean().exec();
    const types = activities.map((a) => a.type);
    expect(types).toContain("MEMBER_ADDED");
    expect(types).toContain("BOARD_CREATED");
  });

  test("non-member cannot GET board (403)", async () => {
    const ownerAgent = await registerAgent("OwnerX", "ownerx@example.com");
    const createRes = await ownerAgent.post("/boards").send({ name: "Private" });
    const boardId = createRes.body.board.id;

    const stranger = await registerAgent("Stranger", "stranger@example.com");
    const res = await stranger.get(`/boards/${boardId}`);
    expect(res.status).toBe(403);
  });

  test("GET activity returns newest first", async () => {
    const owner = await registerAgent("OwnerY", "ownery@example.com");
    const createRes = await owner.post("/boards").send({ name: "Act Board" });
    const boardId = createRes.body.board.id;
    // create another member
    await request(app).post("/auth/register").send({ name: "ActMember", email: "actmember@example.com", password: "password123" });
    await owner.post(`/boards/${boardId}/members`).send({ email: "actmember@example.com" });

    const res = await owner.get(`/boards/${boardId}/activity?limit=10`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.activities)).toBe(true);
    expect(res.body.activities.length).toBeGreaterThanOrEqual(2);
    // newest first
    const first = res.body.activities[0];
    const second = res.body.activities[1];
    expect(new Date(first.createdAt).getTime()).toBeGreaterThanOrEqual(new Date(second.createdAt).getTime());
  });
});