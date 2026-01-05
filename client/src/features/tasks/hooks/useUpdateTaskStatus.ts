import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../lib/apiClient"; // <-- adjust to your apiClient.ts path

type Status = "TODO" | "DOING" | "DONE";

export function useUpdateTaskStatus(boardId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { taskId: string; status: Status }) => {
      const { taskId, status } = input;

      // IMPORTANT: must match your backend route
      return apiFetch(`/boards/${boardId}/tasks/${taskId}`, {
        method: "PATCH",
        body: { status },
      });
    },
    onSuccess: async () => {
      // refetch canonical data
      await qc.invalidateQueries({ queryKey: ["tasks", boardId] });
      await qc.invalidateQueries({ queryKey: ["activity", boardId] });
    },
  });
}
