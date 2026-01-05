import { apiFetch } from "../../../lib/apiClient";
import type { Task } from "../types";

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: "TODO" | "DOING" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
  labels?: string[];
  assignedTo?: string | null;
};

export type UpdateTaskInput = Partial<{
  title: string;
  description: string;
  status: "TODO" | "DOING" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  labels: string[];
  assignedTo: string | null;
  order: number;
}>;

export const tasksApi = {
  create: (boardId: string, body: CreateTaskInput) =>
    apiFetch<{ task: Task }>(`/boards/${boardId}/tasks`, { method: "POST", body }),

  list: (boardId: string) => apiFetch<{ tasks: Task[] }>(`/boards/${boardId}/tasks`),

  update: (taskId: string, body: UpdateTaskInput) =>
    apiFetch<{ task: Task }>(`/tasks/${taskId}`, { method: "PATCH", body }),

  remove: (taskId: string) => apiFetch<{ ok: true }>(`/tasks/${taskId}`, { method: "DELETE" }),
  reorder(boardId: string, payload: { updates: { taskId: string; status: string; order: number }[] }) {
    return apiFetch(`/boards/${boardId}/tasks/reorder`, {
      method: "PATCH",
      body: payload,
    });
  },
};
