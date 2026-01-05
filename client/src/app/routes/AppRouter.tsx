import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import { BoardsPage } from "../../features/boards/pages/BoardsPage";
import { BoardPage } from "../../features/boards/pages/BoardPage";
import { AuthGuard } from "../../features/auth/components/AuthGuard";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { AppLayout } from "../../components/layout/AppLayout";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        }
      />

      <Route
        path="/boards"
        element={
          <AuthGuard>
            <AppLayout>
              <BoardsPage />
            </AppLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/boards/:boardId"
        element={
          <AuthGuard>
            <AppLayout>
              <BoardPage />
            </AppLayout>
          </AuthGuard>
        }
      />

      <Route path="*" element={<Navigate to="/boards" replace />} />
    </Routes>
  );
}
