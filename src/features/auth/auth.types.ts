import type { UserProfile } from "../../types/app";

export interface AuthCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isMockAuth: boolean;
}
