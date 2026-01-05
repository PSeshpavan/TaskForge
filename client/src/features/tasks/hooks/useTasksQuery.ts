import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "../api/tasksApi";

export function useTasksQuery(boardId: string) {
  return useQuery({
    queryKey: ["tasks", boardId],
    queryFn: () => tasksApi.list(boardId),
    enabled: !!boardId,
  });
}
