import { useQuery } from "@tanstack/react-query";
import { boardsApi } from "../api/boardsApi";
import type { BoardSummary } from "../types";

export function useBoardsQuery() {
  return useQuery<{ boards: BoardSummary[] }>({
    queryKey: ["boards"],
    queryFn: () => boardsApi.list(),
  });
}
