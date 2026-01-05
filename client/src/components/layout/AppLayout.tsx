import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Toast } from "../Toast";
import { Spinner } from "../Spinner";
import { Button } from "../Button";
import { useLogout } from "../../features/auth/hooks/useLogout";
import { useMeQuery } from "../../features/auth/hooks/useMeQuery";
import { clearToast } from "../../ui/uiSlice";
import type { RootState } from "../../app/store/store";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isPending } = useMeQuery();
  const logout = useLogout();
  const toast = useSelector((state: RootState) => state.ui.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(clearToast()), 4000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-[0.2em] text-white">TaskForge</div>
            {data?.user && (
              <div className="text-xs text-slate-400">
                {data.user.name} · {data.user.email}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isPending && <Spinner size={4} />}
            {data?.user && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => logout.mutateAsync()}
                disabled={logout.isPending}
              >
                {logout.isPending ? "Signing out..." : "Logout"}
              </Button>
            )}
          </div>
        </div>
      </div>
      {toast && (
        <Toast message={toast.message} variant={toast.variant} onClose={() => dispatch(clearToast())} />
      )}
      <main className="py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};
