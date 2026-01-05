import { makeApp, makeAgent } from "./helpers/app";
import { seedOwner, seedBoard, createTask } from "./helpers/seed";
import { pickId } from "./helpers/ids";

describe("tasks routes", () => {
  it("create + list tasks for board", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent);

    await createTask(agent, boardId, { title: "T1", status: "TODO" });

    const list = await agent.get(`/boards/${boardId}/tasks`);
    expect(list.status).toBe(200);

    const tasks = list.body?.tasks ?? [];
    expect(tasks.length).toBe(1);
  });

  it("PATCH /tasks/:taskId edits; DELETE /tasks/:taskId deletes", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent);

    const { taskId } = await createTask(agent, boardId, { title: "Old", status: "TODO" });

    const patch = await agent.patch(`/tasks/${taskId}`).send({ title: "New" });
    expect([200, 204]).toContain(patch.status);

    const del = await agent.delete(`/tasks/${taskId}`);
    expect([200, 204]).toContain(del.status);
  });

  it("PATCH /boards/:boardId/tasks/:taskId updates status", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent);

    const { taskId } = await createTask(agent, boardId, { title: "Move me", status: "TODO" });

    const upd = await agent
      .patch(`/boards/${boardId}/tasks/${taskId}`)
      .send({ status: "DONE" });

    expect([200, 204]).toContain(upd.status);

    const list = await agent.get(`/boards/${boardId}/tasks`).expect(200);
    const t = (list.body?.tasks ?? []).find((x: any) => (pickId(x) === taskId));
    expect(t?.status).toBe("DONE");
  });

  it("invalid ids -> 400", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent);

    expect((await agent.get(`/boards/not-valid/tasks`)).status).toBe(400);
    expect((await agent.patch(`/tasks/not-valid`).send({ title: "x" })).status).toBe(400);
    expect((await agent.delete(`/tasks/not-valid`)).status).toBe(400);
    expect((await agent.patch(`/boards/${boardId}/tasks/not-valid`).send({ status: "DONE" })).status).toBe(400);
  });
});
