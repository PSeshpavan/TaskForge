import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "../api/boardsApi";

export function useCreateBoard() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string }) => boardsApi.create(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}
