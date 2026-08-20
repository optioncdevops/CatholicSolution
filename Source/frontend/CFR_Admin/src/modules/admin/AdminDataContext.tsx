import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { MOCK_ACTIVITY, MOCK_APPLICATIONS, MOCK_ORGANIZATIONS, MOCK_REQUESTS, MOCK_USERS } from './mockData';
import type {
  AccessRequest, ActivityItem, AdminApplication, AdminUser, Organization, RequestStatus, UserStatus,
} from './types';

interface AdminDataContextValue {
  applications: AdminApplication[];
  organizations: Organization[];
  users: AdminUser[];
  requests: AccessRequest[];
  activity: ActivityItem[];
  getApplication: (id: string) => AdminApplication | undefined;
  getOrganization: (id: string) => Organization | undefined;
  getUser: (id: string) => AdminUser | undefined;
  upsertApplication: (app: AdminApplication) => void;
  deleteApplication: (id: string) => void;
  setUserStatus: (id: string, status: UserStatus) => void;
  grantUserAccess: (userId: string, appId: string) => void;
  revokeUserAccess: (userId: string, appId: string) => void;
  assignOrgApp: (orgId: string, appId: string) => void;
  removeOrgApp: (orgId: string, appId: string) => void;
  resolveRequest: (id: string, status: RequestStatus, note?: string) => void;
  logActivity: (message: string, kind: ActivityItem['kind']) => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<AdminApplication[]>(MOCK_APPLICATIONS);
  const [organizations, setOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [requests, setRequests] = useState<AccessRequest[]>(MOCK_REQUESTS);
  const [activity, setActivity] = useState<ActivityItem[]>(MOCK_ACTIVITY);

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
    getApplication: (id) => applications.find((app) => app.id === id),
    getOrganization: (id) => organizations.find((org) => org.id === id),
    getUser: (id) => users.find((user) => user.id === id),
    upsertApplication: (app) => {
      setApplications((current) => {
        const exists = current.some((item) => item.id === app.id);
        return exists ? current.map((item) => (item.id === app.id ? app : item)) : [app, ...current];
      });
      logActivity(`${applications.some((item) => item.id === app.id) ? 'Updated' : 'Created'} application "${app.name}"`, 'application');
    },
    deleteApplication: (id) => {
      const app = applications.find((item) => item.id === id);
      setApplications((current) => current.filter((item) => item.id !== id));
      if (app) logActivity(`Removed application "${app.name}" from the registry`, 'application');
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
    logActivity,
  }), [applications, organizations, users, requests, activity]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used within AdminDataProvider');
  return context;
}
