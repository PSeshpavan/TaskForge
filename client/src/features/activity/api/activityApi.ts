import { apiFetch } from "../../../lib/apiClient";

export const activityApi = {
  list: (boardId: string, limit = 20) => apiFetch<{ activities: any[] }>(`/boards/${boardId}/activity?limit=${limit}`),
};