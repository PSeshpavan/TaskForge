import { makeApp, makeAgent } from "./helpers/app";

describe("auth routes", () => {
  it("POST /auth/register -> 201 and sets cookie", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    const res = await agent.post("/auth/register").send({
      name: "A",
      email: "a@test.com",
      password: "Password123!",
    });

    expect(res.status).toBe(201);
    expect(Array.isArray(res.headers["set-cookie"]) ? res.headers["set-cookie"]?.join(";") : res.headers["set-cookie"] || "").toContain("access_token=");
    expect(res.body?.user).toBeTruthy();
  });

  it("POST /auth/login -> 200 and sets cookie", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await agent.post("/auth/register").send({
      name: "A",
      email: "a@test.com",
      password: "Password123!",
    });

    const res = await agent.post("/auth/login").send({
      email: "a@test.com",
      password: "Password123!",
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.headers["set-cookie"]) ? res.headers["set-cookie"]?.join(";") : res.headers["set-cookie"] || "").toContain("access_token=");
    expect(res.body?.user).toBeTruthy();
  });

  it("GET /auth/me -> 401 without cookie", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    const res = await agent.get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /auth/me -> 200 with cookie", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await agent.post("/auth/register").send({
      name: "A",
      email: "a@test.com",
      password: "Password123!",
    });

    const res = await agent.get("/auth/me");
    expect(res.status).toBe(200);
    expect(res.body?.user).toBeTruthy();
  });

  it("POST /auth/logout clears cookie (and /me becomes 401)", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await agent.post("/auth/register").send({
      name: "A",
      email: "a@test.com",
      password: "Password123!",
    });

    const out = await agent.post("/auth/logout");
    expect(out.status).toBe(200);

    const me = await agent.get("/auth/me");
    expect(me.status).toBe(401);
  });

  it("register/login validation -> 400 for bad body", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    const r1 = await agent.post("/auth/register").send({ email: "x" });
    expect(r1.status).toBe(400);

    const r2 = await agent.post("/auth/login").send({ email: "x" });
    expect(r2.status).toBe(400);
  });
});
