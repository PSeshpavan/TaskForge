import { useQuery } from "@tanstack/react-query";
import { boardsApi } from "../api/boardsApi";
import type { BoardDetail } from "../types";

export function useBoardQuery(boardId: string) {
  return useQuery<BoardDetail>({
    queryKey: ["board", boardId],
    queryFn: () => boardsApi.get(boardId),
    enabled: !!boardId,
  });
}
