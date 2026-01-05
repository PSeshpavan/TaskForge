import { apiFetch } from "../../../lib/apiClient";
import type { Board, BoardSummary, BoardDetail, BoardMember, ManageableBoardRole } from "../types";

export const boardsApi = {
  create: (payload: { name: string }) => apiFetch<{ board: Board }>("/boards", { method: "POST", body: payload }),
  list: () => apiFetch<{ boards: BoardSummary[] }>("/boards"),
  get: (boardId: string) => apiFetch<BoardDetail>(`/boards/${boardId}`),
  patch: (boardId: string, body: any) => apiFetch<{ board: Board }>(`/boards/${boardId}`, { method: "PATCH", body }),
  del: (boardId: string) => apiFetch(`/boards/${boardId}`, { method: "DELETE" }),
  addMember: (boardId: string, body: { email: string }) =>
    apiFetch<{ members: BoardMember[] }>(`/boards/${boardId}/members`, { method: "POST", body }),
  activity: (boardId: string, limit = 20) => apiFetch<{ activities: any[] }>(`/boards/${boardId}/activity?limit=${limit}`),
  updateMemberRole: (boardId: string, memberId: string, body: { role: ManageableBoardRole }) =>
    apiFetch<{ members: BoardMember[] }>(`/boards/${boardId}/members/${memberId}`, { method: "PATCH", body }),
  removeMember: (boardId: string, memberId: string) =>
    apiFetch<{ members: BoardMember[] }>(`/boards/${boardId}/members/${memberId}`, { method: "DELETE" }),
  members: (boardId: string) => apiFetch<{ members: BoardMember[] }>(`/boards/${boardId}/members`),
};
