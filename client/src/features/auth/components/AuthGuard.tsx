import { useMeQuery } from "../hooks/useMeQuery";
import {Spinner} from "../../../components/Spinner";
import { Navigate, useLocation } from "react-router-dom";
import type { ApiError } from "../../../lib/apiClient";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data, isPending, isError, error } = useMeQuery();
  const loc = useLocation();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // treat 401 as unauthenticated
  const err = error as ApiError | null;
  const unauthorized = isError && err?.status === 401;

  if (unauthorized || !data?.user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  return <>{children}</>;
}
