import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "../api/boardsApi";

export function useDeleteBoard(boardId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => boardsApi.del(boardId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["boards"] });
      await qc.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });
}
