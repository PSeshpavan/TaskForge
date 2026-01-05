import type request from "supertest";

export async function register(
  agent: request.SuperAgentTest,
  user: { name: string; email: string; password: string }
) {
  const res = await agent.post("/auth/register").send(user);
  return res;
}

export async function login(
  agent: request.SuperAgentTest,
  creds: { email: string; password: string }
) {
  const res = await agent.post("/auth/login").send(creds);
  return res;
}

export async function logout(agent: request.SuperAgentTest) {
  return agent.post("/auth/logout");
}
