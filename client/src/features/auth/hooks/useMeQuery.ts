import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import type { User } from "../types";

export function useMeQuery() {
  return useQuery<{ user: User }, unknown, { user: User }>({
    queryKey: ["me"],
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}