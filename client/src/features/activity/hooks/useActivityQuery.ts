import { useQuery } from "@tanstack/react-query";
import { activityApi } from "../api/activityApi";

export function useActivityQuery(boardId: string, limit = 20) {
  return useQuery({
    queryKey: ["activity", boardId, limit],
    queryFn: () => activityApi.list(boardId, limit),
    enabled: !!boardId,
  });
}