import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type {
  AccessRequest, ActivityItem, AdminApplication, AdminRole, AdminUser, License, Organization,
  ProductStatus, RequestStatus, UserStatus,
} from './types';

/** US software product-key alphabet — digits 0/1 and letters I/O are excluded since they're
 * easily confused with each other, the standard convention for US-issued license keys. */
const LICENSE_KEY_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

interface AdminDataContextValue {
  applications: AdminApplication[];
  organizations: Organization[];
  users: AdminUser[];
  requests: AccessRequest[];
  activity: ActivityItem[];
  roles: AdminRole[];
  licenses: License[];
  getApplication: (id: string) => AdminApplication | undefined;
  getOrganization: (id: string) => Organization | undefined;
  getUser: (id: string) => AdminUser | undefined;
  getRole: (id: string) => AdminRole | undefined;
  /** Updates an existing product's editable metadata. Products cannot be created or deleted here. */
  updateApplication: (app: AdminApplication) => void;
  setApplicationStatus: (id: string, status: ProductStatus) => void;
  addUser: (user: Omit<AdminUser, 'id' | 'appAccessIds' | 'lastActiveAt'>) => void;
  setUserStatus: (id: string, status: UserStatus) => void;
  grantUserAccess: (userId: string, appId: string) => void;
  revokeUserAccess: (userId: string, appId: string) => void;
  addOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'code' | 'appIds'>) => void;
  /** Updates an existing organization's profile fields (identity, contact, address, preferences, branding). */
  updateOrganization: (org: Organization) => void;
  assignOrgApp: (orgId: string, appId: string) => void;
  removeOrgApp: (orgId: string, appId: string) => void;
  resolveRequest: (id: string, status: RequestStatus, note?: string) => void;
  addRole: (role: Omit<AdminRole, 'id' | 'createdAt' | 'active'>) => void;
  updateRole: (role: AdminRole) => void;
  duplicateRole: (id: string) => void;
  deleteRole: (id: string) => void;
  /** Toggles the active/inactive lifecycle flag on a role — roles are never deleted this way. */
  toggleRoleActive: (id: string) => void;
  /** Issues a new license to a customer/product. This is the only license mutation —
   * licenses otherwise stay read-only once issued. */
  addLicense: (license: Omit<License, 'id' | 'licenseNumber' | 'licenseKey'>) => void;
  logActivity: (message: string, kind: ActivityItem['kind']) => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);

  const logActivity = (message: string, kind: ActivityItem['kind']) => {
    setActivity((current) => [
      { id: `act-${Date.now()}-${Math.round(Math.random() * 1000)}`, message, at: new Date().toISOString().slice(0, 10), actor: 'Admin', kind },
      ...current,
    ]);
  };

  const value = useMemo<AdminDataContextValue>(() => ({
    applications,
    organizations,
    users,
    requests,
    activity,
    roles,
    licenses,
    getApplication: (id) => applications.find((app) => app.id === id),
    getOrganization: (id) => organizations.find((org) => org.id === id),
    getUser: (id) => users.find((user) => user.id === id),
    getRole: (id) => roles.find((role) => role.id === id),
    updateApplication: (app) => {
      setApplications((current) => current.map((item) => (item.id === app.id ? app : item)));
      logActivity(`Updated product "${app.name}"`, 'application');
    },
    setApplicationStatus: (id, status) => {
      setApplications((current) => current.map((item) => (item.id === id ? { ...item, status, updatedAt: new Date().toISOString().slice(0, 10) } : item)));
      const app = applications.find((item) => item.id === id);
      if (app) logActivity(`Changed "${app.name}" status from ${app.status} to ${status}`, 'application');
    },
    addUser: (user) => {
      const id = `user-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      setUsers((current) => [...current, { ...user, id, appAccessIds: [], lastActiveAt: '—' }]);
      logActivity(`Added user "${user.name}"`, 'user');
    },
    setUserStatus: (id, status) => {
      setUsers((current) => current.map((user) => (user.id === id ? { ...user, status } : user)));
      const user = users.find((item) => item.id === id);
      if (user) logActivity(`${status === 'active' ? 'Activated' : status === 'deactivated' ? 'Deactivated' : 'Invited'} ${user.name}`, 'user');
    },
    grantUserAccess: (userId, appId) => {
      setUsers((current) => current.map((user) => (
        user.id === userId && !user.appAccessIds.includes(appId)
          ? { ...user, appAccessIds: [...user.appAccessIds, appId] }
          : user
      )));
      const user = users.find((item) => item.id === userId);
      const app = applications.find((item) => item.id === appId);
      if (user && app) logActivity(`Granted ${user.name} access to ${app.name}`, 'user');
    },
    revokeUserAccess: (userId, appId) => {
      setUsers((current) => current.map((user) => (
        user.id === userId ? { ...user, appAccessIds: user.appAccessIds.filter((id) => id !== appId) } : user
      )));
      const user = users.find((item) => item.id === userId);
      const app = applications.find((item) => item.id === appId);
      if (user && app) logActivity(`Revoked ${user.name}'s access to ${app.name}`, 'user');
    },
    addOrganization: (org) => {
      const id = `org-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      const code = `CUST-${1000 + organizations.length + 1}`;
      setOrganizations((current) => [...current, { ...org, id, code, appIds: [], createdAt: new Date().toISOString() }]);
      logActivity(`Added organization "${org.name}"`, 'organization');
    },
    updateOrganization: (org) => {
      setOrganizations((current) => current.map((item) => (item.id === org.id ? org : item)));
      logActivity(`Updated organization profile for "${org.name}"`, 'organization');
    },
    assignOrgApp: (orgId, appId) => {
      setOrganizations((current) => current.map((org) => (
        org.id === orgId && !org.appIds.includes(appId) ? { ...org, appIds: [...org.appIds, appId] } : org
      )));
      const org = organizations.find((item) => item.id === orgId);
      const app = applications.find((item) => item.id === appId);
      if (org && app) logActivity(`Assigned ${app.name} to ${org.name}`, 'organization');
    },
    removeOrgApp: (orgId, appId) => {
      setOrganizations((current) => current.map((org) => (
        org.id === orgId ? { ...org, appIds: org.appIds.filter((id) => id !== appId) } : org
      )));
      const org = organizations.find((item) => item.id === orgId);
      const app = applications.find((item) => item.id === appId);
      if (org && app) logActivity(`Removed ${app.name} from ${org.name}`, 'organization');
    },
    resolveRequest: (id, status, note) => {
      setRequests((current) => current.map((request) => (
        request.id === id
          ? { ...request, status, timeline: [...request.timeline, { status, at: new Date().toISOString().slice(0, 10), actor: 'Admin', note }] }
          : request
      )));
      const request = requests.find((item) => item.id === id);
      const app = request ? applications.find((item) => item.id === request.appId) : undefined;
      if (request && app) {
        const verb = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Requested more information for';
        logActivity(`${verb} ${app.name} access request from ${request.requesterName}`, 'request');
      }
    },
    addRole: (role) => {
      const id = `role-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      setRoles((current) => [...current, { ...role, id, active: true, createdAt: new Date().toISOString().slice(0, 10) }]);
      logActivity(`Added role "${role.name}"`, 'user');
    },
    updateRole: (role) => {
      setRoles((current) => current.map((item) => (item.id === role.id ? role : item)));
      logActivity(`Updated role "${role.name}"`, 'user');
    },
    duplicateRole: (id) => {
      const source = roles.find((role) => role.id === id);
      if (!source) return;
      const copyId = `role-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      setRoles((current) => [...current, { ...source, id: copyId, name: `${source.name} (Copy)`, createdAt: new Date().toISOString().slice(0, 10) }]);
      logActivity(`Duplicated role "${source.name}"`, 'user');
    },
    deleteRole: (id) => {
      const source = roles.find((role) => role.id === id);
      setRoles((current) => current.filter((role) => role.id !== id));
      if (source) logActivity(`Deleted role "${source.name}"`, 'user');
    },
    toggleRoleActive: (id) => {
      const role = roles.find((existing) => existing.id === id);
      setRoles((current) => current.map((existing) => (existing.id === id ? { ...existing, active: !existing.active } : existing)));
      if (role) logActivity(`${role.active ? 'Deactivated' : 'Activated'} role "${role.name}"`, 'user');
    },
    addLicense: (license) => {
      const id = `lic-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      const sequence = licenses.length + 1001;
      const licenseKey = Array.from({ length: 5 }, () => (
        Array.from({ length: 5 }, () => LICENSE_KEY_CHARS[Math.floor(Math.random() * LICENSE_KEY_CHARS.length)]).join('')
      )).join('-');
      setLicenses((current) => [...current, { ...license, id, licenseNumber: `LIC-2026-${sequence}`, licenseKey }]);
      const org = organizations.find((item) => item.id === license.orgId);
      const app = applications.find((item) => item.id === license.appId);
      logActivity(`Issued license LIC-2026-${sequence} for ${org?.name ?? license.orgId} · ${app?.name ?? license.appId}`, 'application');
    },
    logActivity,
  }), [applications, organizations, users, requests, activity, roles, licenses]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within AdminDataProvider');
  return context;
}
