import { useQuery } from "@tanstack/react-query";
import { boardsApi } from "../api/boardsApi";

export function useBoardsQuery() {
  return useQuery({
    queryKey: ["boards"],
    queryFn: () => boardsApi.list(),
  });
}