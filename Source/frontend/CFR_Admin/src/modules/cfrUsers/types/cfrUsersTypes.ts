export interface CFRUserApiItem {
  authUserId: number;
  email: string | null;
  fullName: string;
  roleName: string | null;
  orgId: number;
  orgName: string;
  status: 'active' | 'pending' | string;
  linkedDate: string;
  appCount: number;
  appNames: string | null;
}

export interface CFRUsersResponse {
  users: CFRUserApiItem[];
  activeCount: number;
  pendingCount: number;
}
