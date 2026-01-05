import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasksApi";
import type { Task } from "../types";
import type { ApiError } from "../../../lib/apiClient";

type ReorderUpdate = {
  taskId: string;
  status: Task["status"];
  order: number;
};

export function useReorderTasks(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { updates: ReorderUpdate[] }) =>
      tasksApi.reorder(boardId, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", boardId] });
      const previous = queryClient.getQueryData<{ tasks: Task[] }>(["tasks", boardId]);
      queryClient.setQueryData<{ tasks: Task[] }>(["tasks", boardId], (old) => {
        if (!old) return old;
        const map = new Map(payload.updates.map((u) => [u.taskId, u]));
        const updated = old.tasks.map((task) => {
          const id = task.id ?? task._id;
          const entry = map.get(id);
          if (entry) {
            return { ...task, status: entry.status, order: entry.order };
          }
          return task;
        });
        return { ...old, tasks: updated };
      });
      return { previous };
    },
    onError: (_error: ApiError, _payload, context: { previous?: { tasks: Task[] } } | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks", boardId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: ["activity", boardId] });
    },
  });
}
