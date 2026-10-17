import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ROUTES } from "@/lib/routes";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { VerifyPage } from "@/pages/VerifyPage";

export function App() {
  return (
    <Routes>
      <Route path={ROUTES.landing} element={<Navigate to={ROUTES.verify} replace />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.authCallback} element={<AuthCallbackPage />} />
      <Route path={ROUTES.privacy} element={<PrivacyPage />} />

      <Route element={<AppShell />}>
        <Route path={ROUTES.verify} element={<VerifyPage />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.history} element={<HistoryPage />} />
        </Route>
      </Route>

      {/* Paths from before the app moved under /app. */}
      <Route path="/history" element={<Navigate to={ROUTES.history} replace />} />
      <Route path="/settings" element={<Navigate to={ROUTES.settings} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
    </Routes>
  );
}
