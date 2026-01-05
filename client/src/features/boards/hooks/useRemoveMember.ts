import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "../api/boardsApi";

export function useRemoveMember(boardId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => boardsApi.removeMember(boardId, memberId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });
}
