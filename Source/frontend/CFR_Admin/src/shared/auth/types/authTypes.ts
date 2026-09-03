export interface AcutisLoginUser {
  userId: number;
  accessLevel: number;
  roleId: number;
  eMail: string;
  firstName: string;
  lastName: string;
  fullName: string;
  organizationId: number;
  status: string;
  landingURL: string;
  lastActiveAt: string | null;
  token: string;
  // Not part of the login response — patched in locally by updateStoredAcutisUser after the
  // Profile page loads/saves, so the account menu avatar reflects it without a second sign-in.
  profileImageUrl?: string | null;
}

export interface AcutisModuleRight {
  displayName: string;
  moduleName: string;
  userRight: number;
  roleId: number;
  featureID: number;
  levelId: number;
  parentId: number;
  isHideMenu: number;
  displayOrder: number;
  icon: string;
  routingUrl: string;
}

export interface AcutisSubMenuItem {
  label: string;
  icon: string;
  sessionKey: string;
  path: string;
  tablinks?: AcutisSubMenuItem[];
  activity?: AcutisSubMenuItem[];
}

export interface AcutisMenuItem {
  title: string;
  icon: string;
  sessionKey: string;
  path: string;
  links: AcutisSubMenuItem[];
  btnlinks: AcutisSubMenuItem[];
  activity: AcutisSubMenuItem[];
}

export interface AcutisLoginResultData {
  user: AcutisLoginUser;
  moduleRights: AcutisModuleRight[];
  menuItems: AcutisMenuItem[];
}

export interface AcutisLoginApiResponse {
  statusCode: number;
  statusMessage: string;
  resultData: AcutisLoginResultData;
  errors?: unknown;
  traceId?: string;
}

export interface LoginAuthenticationPayload {
  userName: string;
  password: string;
  ipAddress?: string;
}

export interface ForgotPasswordPayload {
  userName: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileApiItem {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
