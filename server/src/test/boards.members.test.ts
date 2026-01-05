import { makeApp, makeAgent } from "./helpers/app";
import { seedOwner, seedMember, seedBoard } from "./helpers/seed";

describe("board members routes", () => {
  it("owner can add member by email; member is not OWNER", async () => {
    const app = makeApp();

    const ownerAgent = makeAgent(app);
    await seedOwner(ownerAgent);
    const boardId = await seedBoard(ownerAgent);

    const memberAgent = makeAgent(app);
    const member = await seedMember(memberAgent);

    const add = await ownerAgent.post(`/boards/${boardId}/members`).send({ email: member.email });
    expect(add.status).toBe(200);

    const asMember = await memberAgent.get(`/boards/${boardId}`);
    expect(asMember.status).toBe(200);

    const members = asMember.body?.members ?? [];
    const ownerEntry = members.find((m: any) => m.role === "OWNER");
    const meEntry = members.find((m: any) => m.user?.email === member.email);

    expect(ownerEntry).toBeTruthy();
    expect(meEntry).toBeTruthy();
    expect(meEntry.role).not.toBe("OWNER");
  });

  it("update member role + remove member endpoints respond (owner only)", async () => {
    const app = makeApp();

    const ownerAgent = makeAgent(app);
    await seedOwner(ownerAgent);
    const boardId = await seedBoard(ownerAgent);

    const memberAgent = makeAgent(app);
    const member = await seedMember(memberAgent);

    await ownerAgent.post(`/boards/${boardId}/members`).send({ email: member.email }).expect(200);

    const board = await ownerAgent.get(`/boards/${boardId}`).expect(200);
    const members = board.body?.members ?? [];
    const memberRow = members.find((m: any) => m.user?.email === member.email);
    expect(memberRow).toBeTruthy();

    const memberId = memberRow.id || memberRow._id;
    expect(memberId).toBeTruthy();

    const up = await ownerAgent
      .patch(`/boards/${boardId}/members/${memberId}`)
      .send({ role: "MEMBER" }); // adjust if you support ADMIN etc
    expect([200, 204]).toContain(up.status);

    const rm = await ownerAgent.delete(`/boards/${boardId}/members/${memberId}`);
    expect([200, 204]).toContain(rm.status);
  });

  it("invalid params -> 400", async () => {
    const app = makeApp();
    const agent = makeAgent(app);

    await seedOwner(agent);

    const r1 = await agent.post(`/boards/not-valid/members`).send({ email: "x@test.com" });
    expect(r1.status).toBe(400);

    const r2 = await agent.patch(`/boards/not-valid/members/not-valid`).send({ role: "MEMBER" });
    expect(r2.status).toBe(400);

    const r3 = await agent.delete(`/boards/not-valid/members/not-valid`);
    expect(r3.status).toBe(400);
  });
});
