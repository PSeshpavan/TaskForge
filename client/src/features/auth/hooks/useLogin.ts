import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";

export function useLogin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (creds: { email: string; password: string }) => authApi.login(creds),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
