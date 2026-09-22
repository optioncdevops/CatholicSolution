export type RuntimeEnvironment = 'development' | 'pilot' | 'staging' | 'live';
export type SignInProvider = 'password' | 'google' | 'microsoft';
export type SignInResult = 'authenticated' | 'redirected' | 'unavailable';

export interface SignInRequest {
  email: string;
  password?: string;
  remember?: boolean;
  provider?: SignInProvider;
  clientId?: string;
  returnUrl?: string;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  signIn: (request: SignInRequest) => Promise<SignInResult>;
  signOut: () => void;
}

export interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface ResetPasswordFormValues {
  code: string;
  password: string;
  confirmPassword: string;
}

export interface PortalLoginUser {
  userId?: number;
  eMail?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
}
