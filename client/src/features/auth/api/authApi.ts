import { apiFetch } from "../../../lib/apiClient";
import type { User } from "../types";

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiFetch<{ user: User }>("/auth/register", { method: "POST", body }),

  login: (body: { email: string; password: string }) =>
    apiFetch<{ user: User }>("/auth/login", { method: "POST", body }),

  me: () => apiFetch<{ user: User }>("/auth/me"),

  logout: () => apiFetch<{ ok: true }>("/auth/logout", { method: "POST" }),
};
