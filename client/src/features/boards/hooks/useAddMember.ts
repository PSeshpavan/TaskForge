import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "../api/boardsApi";

export function useAddMember(boardId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { email: string }) => {
      if (!boardId) {
        return Promise.reject(new Error("Board ID missing"));
      }
      return boardsApi.addMember(boardId, payload);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["board", boardId] });
      await qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}
