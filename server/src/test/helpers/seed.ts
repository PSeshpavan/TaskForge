import type request from "supertest";
import { pickId } from "./ids";
import type { TestAgent } from "./app";

export async function seedOwner(agent: TestAgent) {
  const owner = { name: "Owner", email: "owner@test.com", password: "Password123!" };
  const r = await agent.post("/auth/register").send(owner);
  if (r.status !== 201) throw new Error(`seedOwner failed: ${r.status} ${JSON.stringify(r.body)}`);
  return owner;
}

export async function seedMember(agent: TestAgent) {
  const member = { name: "Member", email: "member@test.com", password: "Password123!" };
  const r = await agent.post("/auth/register").send(member);
  if (r.status !== 201) throw new Error(`seedMember failed: ${r.status} ${JSON.stringify(r.body)}`);
  return member;
}

export async function seedBoard(agent: TestAgent, name = "Board A") {
  const r = await agent.post("/boards").send({ name });
  if (r.status !== 201) throw new Error(`seedBoard failed: ${r.status} ${JSON.stringify(r.body)}`);
  const boardId = pickId(r.body?.board) || r.body?.boardId;
  if (!boardId) throw new Error(`seedBoard missing board id: ${JSON.stringify(r.body)}`);
  return boardId as string;
}

export async function createTask(
  agent: TestAgent,
  boardId: string,
  payload: any
) {
  const r = await agent.post(`/boards/${boardId}/tasks`).send(payload);
  if (r.status !== 201) throw new Error(`createTask failed: ${r.status} ${JSON.stringify(r.body)}`);
  const taskId = pickId(r.body?.task) || r.body?.taskId;
  if (!taskId) throw new Error(`createTask missing task id: ${JSON.stringify(r.body)}`);
  return { taskId: taskId as string, body: r.body };
}
