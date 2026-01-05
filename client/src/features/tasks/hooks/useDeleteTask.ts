import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasksApi";

export function useDeleteTask(boardId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(taskId) as Promise<{ ok: true }>,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks", boardId] });
      await qc.invalidateQueries({ queryKey: ["activity", boardId] });
    },
  });
}
