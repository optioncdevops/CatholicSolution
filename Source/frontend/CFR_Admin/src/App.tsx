import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CentralLoginPage } from "@shared/auth/CentralLoginPage";
import { CentralLogoutPage } from "@shared/auth/CentralLogoutPage";
import { ForgotPasswordPage } from "@shared/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@shared/auth/ResetPasswordPage";
import { ProtectedRoute } from "@shared/auth/ProtectedRoute";
import { AdminDataProvider } from "@/modules/AdminDataContext";
import { AdminShell } from "@/modules/components/AdminShell";
import { usersRoutes } from "@/modules/users";
import { cfrUsersRoutes } from "@/modules/cfrUsers";
import { userRolesRoutes } from "@/modules/administration/userRoles";
import { userRightsRoutes } from "@/modules/administration/userRights";
import { emailTemplatesRoutes } from "@/modules/administration/emailTemplates";
import { emailSettingsRoutes } from "@/modules/administration/emailSettings";
import { organizationsRoutes } from "@/modules/organizations";
import { requestsRoutes } from "@/modules/requests";
import { productsRoutes } from "@/modules/cfrproducts";

const DashboardPage = lazy(() =>
  import("@/modules/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const ProfilePage = lazy(() =>
  import("@/modules/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
// Dev-only component reference (production-readiness H2) — see the removal note at the top of
// either sample page file. `import.meta.env.DEV` is statically known at build time, so in every
// hosted mode (pilot/staging/live) this whole ternary collapses to `null` and the dynamic
// import() below is never reachable, which removes both the route and its chunk from that
// build's output entirely (verified via `npm run build:live` — no SampleAddPage/SampleViewPage/
// sampleData chunk is emitted). Only a `development`-mode build (`import.meta.env.DEV === true`)
// actually registers and bundles these.
const SampleAddPage = import.meta.env.DEV
  ? lazy(() =>
      import("@/modules/sample/SampleAddPage").then((m) => ({
        default: m.SampleAddPage,
      })),
    )
  : null;
const SampleViewPage = import.meta.env.DEV
  ? lazy(() =>
      import("@/modules/sample/SampleViewPage").then((m) => ({
        default: m.SampleViewPage,
      })),
    )
  : null;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<CentralLoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/logout" element={<CentralLogoutPage />} />
      <Route
        path="/"
        element={
          // client_id/returnUrl dropped here: CentralLoginPage in this app always renders the
          // fixed Admin sign-in experience and hardcodes its own post-login destination — it
          // never reads either param (see CentralLoginPage.tsx), so they were dead weight in the
          // URL. `entry` is the only param this route actually consumes.
          <Navigate
            to="/login?entry=platform"
            replace
          />
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <AdminDataProvider>
              <AdminShell />
            </AdminDataProvider>
          }
        >
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
          {organizationsRoutes}
          {productsRoutes}
          {usersRoutes}
          {cfrUsersRoutes}
          {userRolesRoutes}
          {userRightsRoutes}
          {requestsRoutes}
          {emailTemplatesRoutes}
          {emailSettingsRoutes}
          {/* Dev-only, never registered in a hosted build — see the removal note at the top of
              SampleAddPage.tsx / SampleViewPage.tsx. */}
          {SampleAddPage ? (
            <Route
              path="/admin/administration/component-library/add"
              element={<SampleAddPage />}
            />
          ) : null}
          {SampleViewPage ? (
            <Route
              path="/admin/administration/component-library/view"
              element={<SampleViewPage />}
            />
          ) : null}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
