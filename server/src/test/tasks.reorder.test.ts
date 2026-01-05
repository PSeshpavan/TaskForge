import { makeApp, makeAgent } from "./helpers/app";
import { seedOwner, seedBoard, createTask } from "./helpers/seed";
import { pickId } from "./helpers/ids";

describe("tasks reorder route", () => {
  it("PATCH /boards/:boardId/tasks/reorder persists order", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent);

    const t1 = await createTask(agent, boardId, { title: "A", status: "TODO", order: 1000 });
    const t2 = await createTask(agent, boardId, { title: "B", status: "TODO", order: 2000 });

    const updates = [
      { taskId: t2.taskId, status: "TODO", order: 1000 },
      { taskId: t1.taskId, status: "TODO", order: 2000 },
    ];

    const res = await agent.patch(`/boards/${boardId}/tasks/reorder`).send({ updates });
    expect([200, 204]).toContain(res.status);

    const list = await agent.get(`/boards/${boardId}/tasks`).expect(200);
    const todo = (list.body?.tasks ?? []).filter((t: any) => t.status === "TODO");
    todo.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

    expect(pickId(todo[0])).toBe(t2.taskId);
    expect(pickId(todo[1])).toBe(t1.taskId);
  });

  it("reorder validation -> 400 on bad body", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent);

    const bad = await agent.patch(`/boards/${boardId}/tasks/reorder`).send({ nope: true });
    expect(bad.status).toBe(400);
  });
});
