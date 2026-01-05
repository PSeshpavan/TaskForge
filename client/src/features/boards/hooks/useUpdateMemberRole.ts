import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "../api/boardsApi";

import type { ManageableBoardRole } from "../types";

export function useUpdateMemberRole(boardId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: ManageableBoardRole }) =>
      boardsApi.updateMemberRole(boardId, memberId, { role }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });
}
