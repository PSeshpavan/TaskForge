import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasksApi";
import type { Task } from "../types";

type UpdateTaskInput = Partial<{
  title: string;
  description: string;
  status: "TODO" | "DOING" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  labels: string[];
  assignedTo: string | null;
}>;

export function useUpdateTask(boardId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, body }: { taskId: string; body: UpdateTaskInput }) =>
      tasksApi.update(taskId, body) as Promise<{ task: Task }>,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks", boardId] });
      await qc.invalidateQueries({ queryKey: ["activity", boardId] });
    },
  });
}
