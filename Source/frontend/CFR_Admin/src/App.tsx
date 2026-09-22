import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { authenticationRoutes, ProtectedRoute } from "@/modules/authentication";
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

export default function App() {
  return (
    <Routes>
      {authenticationRoutes}
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
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
