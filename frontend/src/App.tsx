import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppLayout } from "@/components/app-layout";
import { AuthProvider } from "@/features/auth/auth-context";
import { ForgotPasswordPage } from "@/features/auth/forgot-password-page";
import { LoginPage } from "@/features/auth/login-page";
import { ResetPasswordPage } from "@/features/auth/reset-password-page";
import { PublicOnly, RequireAdmin } from "@/features/auth/route-guards";
import { BathroomsPage } from "@/features/bathrooms/bathrooms-page";
import { EditBathroomPage } from "@/features/bathrooms/edit-bathroom-page";
import { NewBathroomPage } from "@/features/bathrooms/new-bathroom-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { RatingsPage } from "@/features/ratings/ratings-page";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<PublicOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            <Route element={<RequireAdmin />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="bathrooms" element={<BathroomsPage />} />
                <Route path="bathrooms/new" element={<NewBathroomPage />} />
                <Route
                  path="bathrooms/:id/edit"
                  element={<EditBathroomPage />}
                />
                <Route path="ratings" element={<RatingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
