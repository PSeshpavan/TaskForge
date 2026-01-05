import { makeApp, makeAgent } from "./helpers/app";
import { seedOwner, seedBoard, createTask } from "./helpers/seed";

describe("activity route", () => {
  it("GET /boards/:boardId/activity returns activities (limit honored)", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent);

    // create some actions that should produce activity in your system
    await createTask(agent, boardId, { title: "A", status: "TODO" });
    await createTask(agent, boardId, { title: "B", status: "TODO" });

    const res = await agent.get(`/boards/${boardId}/activity?limit=1`);
    expect(res.status).toBe(200);

    const activities = res.body?.activities ?? [];
    expect(Array.isArray(activities)).toBe(true);
    expect(activities.length).toBeLessThanOrEqual(1);
  });

  it("invalid boardId -> 400", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);

    const res = await agent.get(`/boards/not-valid/activity`);
    expect(res.status).toBe(400);
  });
});
