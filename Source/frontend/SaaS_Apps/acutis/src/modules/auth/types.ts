// Typed contracts mirroring the CFR.Acutis backend response shapes exactly (camelCase, matching
// System.Text.Json's default policy — confirmed against a running CFR.Acutis instance in prior
// backend tasks). See docs/acutis-auth-spec/api-contract.md for the authoritative endpoint list.

/** CFR.DBEngine.MSResultArgs<T> */
export interface MSResultArgs<T> {
  statusCode: number;
  statusMessage: string;
  resultData: T | null;
  errors: { field: string; message: string }[];
  traceId: string;
}

/** CFR.DBEngine.MSResultArgs (non-generic) — Logout/ChangePassword/ForgotPassword/ResetPassword */
export interface MSResultArgsVoid {
  statusCode: number;
  statusMessage: string;
  resultData: null;
  errors: { field: string; message: string }[];
  traceId: string;
}

// --- Request DTOs (CFR.AcutisInfrastructure/Models/Input/*) ---

export interface AcutisLoginRequest {
  userName: string;
  password: string;
}

export interface AcutisChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AcutisForgotPasswordRequest {
  email: string;
}

export interface AcutisResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// --- Response DTOs (CFR.AcutisInfrastructure/Models/Output/*) ---

/** Thin identity — only what the Acutis JWT itself carries (sub/email/name). */
export interface AcutisLoginUser {
  userId: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  token: string;
}

export interface AcutisModuleRight {
  moduleName: string;
  userRight: number;
  roleId: number;
}

export interface AcutisMenuTab {
  label: string;
  icon: string;
  sessionKey: string;
  path: string;
}

export interface AcutisMenuLink {
  label: string;
  icon: string;
  sessionKey: string;
  path: string;
  tablinks: AcutisMenuTab[];
  activity: AcutisMenuTab[];
}

export interface AcutisMenuGroup {
  title: string;
  icon: string;
  sessionKey: string;
  path: string;
  links: AcutisMenuLink[];
  btnlinks: AcutisMenuLink[];
  activity: AcutisMenuLink[];
}

export interface AcutisLoginResult {
  user: AcutisLoginUser;
  moduleRights: AcutisModuleRight[];
  menuItems: AcutisMenuGroup[];
}

export interface AcutisCurrentUser {
  userId: number;
  email: string | null;
  fullName: string | null;
}
