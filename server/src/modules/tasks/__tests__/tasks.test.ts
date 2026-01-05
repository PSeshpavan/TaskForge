import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createApp } from "../../../app";
import { Activity } from "../../activity/activity.model";
import { Task } from "../tasks.model";
import { BoardMember } from "../../boards/member.model";

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
  const collections = (await mongoose.connection.db?.collections()) ?? [];
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

describe("Tasks module", () => {
  test("owner creates board then creates task => 201 and activity created", async () => {
    const owner = await registerAgent("TaskOwner", "taskowner@example.com");
    const bRes = await owner.post("/boards").send({ name: "TBoard" });
    const boardId = bRes.body.board.id;
    const tRes = await owner.post(`/boards/${boardId}/tasks`).send({ title: "First Task", description: "Do this" });
    expect(tRes.status).toBe(201);
    expect(tRes.body.task.title).toBe("First Task");
    const activities = await Activity.find({ boardId }).lean().exec();
    const types = activities.map((a) => a.type);
    expect(types).toContain("TASK_CREATED");
  });

  test("member can create/update task", async () => {
    const owner = await registerAgent("OwnerT", "ownert@example.com");
    await request(app).post("/auth/register").send({ name: "MemberT", email: "membert@example.com", password: "password123" });
    const bRes = await owner.post("/boards").send({ name: "BoardT" });
    const boardId = bRes.body.board.id;
    // add member
    await owner.post(`/boards/${boardId}/members`).send({ email: "membert@example.com" });

    const member = await registerAgent("MemberT", "membert@example.com"); // logs in as member
    const createRes = await member.post(`/boards/${boardId}/tasks`).send({ title: "Member Task" });
    expect(createRes.status).toBe(201);
    const taskId = createRes.body.task.id;

    const patchRes = await member.patch(`/tasks/${taskId}`).send({ description: "Updated by member" });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.task.description).toBe("Updated by member");
  });

  test("outsider cannot list tasks for board (403)", async () => {
    const owner = await registerAgent("OwnerZ", "ownerz@example.com");
    const outsider = await registerAgent("Out", "out@example.com");
    const bRes = await owner.post("/boards").send({ name: "PrivateBoard" });
    const boardId = bRes.body.board.id;

    const res = await outsider.get(`/boards/${boardId}/tasks`);
    expect(res.status).toBe(403);
  });

  test("PATCH changing status logs TASK_MOVED", async () => {
    const owner = await registerAgent("OwnerM", "ownerm@example.com");
    const bRes = await owner.post("/boards").send({ name: "MoveBoard" });
    const boardId = bRes.body.board.id;
    const tRes = await owner.post(`/boards/${boardId}/tasks`).send({ title: "Move Task" });
    const taskId = tRes.body.task.id;

    const patchRes = await owner.patch(`/tasks/${taskId}`).send({ status: "DOING" });
    expect(patchRes.status).toBe(200);

    const activities = await Activity.find({ boardId }).sort({ createdAt: -1 }).lean().exec();
    const types = activities.map((a) => a.type);
    expect(types).toContain("TASK_MOVED");
  });

  test("DELETE works and logs TASK_DELETED", async () => {
    const owner = await registerAgent("OwnerD", "ownerd@example.com");
    const bRes = await owner.post("/boards").send({ name: "DelBoard" });
    const boardId = bRes.body.board.id;
    const tRes = await owner.post(`/boards/${boardId}/tasks`).send({ title: "Del Task" });
    const taskId = tRes.body.task.id;

    const delRes = await owner.delete(`/tasks/${taskId}`).send();
    expect(delRes.status).toBe(200);
    expect(delRes.body.ok).toBe(true);

    const activities = await Activity.find({ boardId }).lean().exec();
    const types = activities.map((a) => a.type);
    expect(types).toContain("TASK_DELETED");
    const taskDoc = await Task.findById(taskId).lean().exec();
    expect(taskDoc).toBeNull();
  });
});