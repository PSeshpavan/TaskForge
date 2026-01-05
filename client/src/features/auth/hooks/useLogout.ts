import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

export function useLogout() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      await qc.clear();
      navigate("/login", { replace: true });
    },
    onError: async () => {
      await qc.clear();
      navigate("/login", { replace: true });
    },
  });
}
