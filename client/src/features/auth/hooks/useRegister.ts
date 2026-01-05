import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { queryClient } from "../../../app/providers/queryClient";

export function useRegister() {
  return useMutation({
    mutationFn: (payload: { name: string; email: string; password: string }) => authApi.register(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}