import { makeApp, makeAgent } from "./helpers/app";
import { seedOwner, seedBoard } from "./helpers/seed";

describe("boards routes", () => {
  it("401 on /boards without auth", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    const res = await agent.get("/boards");
    expect(res.status).toBe(401);
  });

  it("POST /boards creates board; GET /boards lists it", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent, "My Board");

    const list = await agent.get("/boards");
    expect(list.status).toBe(200);

    const boards = list.body?.boards ?? [];
    expect(Array.isArray(boards)).toBe(true);
    expect(boards.some((b: any) => (b.id || b._id) === boardId)).toBe(true);
  });

  it("GET /boards/:boardId works; invalid id -> 400", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent);

    const ok = await agent.get(`/boards/${boardId}`);
    expect(ok.status).toBe(200);

    const bad = await agent.get(`/boards/not-a-valid-id`);
    expect(bad.status).toBe(400);
  });

  it("PATCH /boards/:boardId updates name", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent);

    const patch = await agent.patch(`/boards/${boardId}`).send({ name: "Renamed" });
    expect([200, 204]).toContain(patch.status);

    const get = await agent.get(`/boards/${boardId}`);
    expect(get.status).toBe(200);
    expect(get.body?.board?.name).toBe("Renamed");
  });

  it("DELETE /boards/:boardId deletes board", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);
    const boardId = await seedBoard(agent);

    const del = await agent.delete(`/boards/${boardId}`);
    expect([200, 204]).toContain(del.status);

    const get = await agent.get(`/boards/${boardId}`);
    expect([401, 403, 404]).toContain(get.status);
  });
});
