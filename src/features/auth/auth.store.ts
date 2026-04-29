import { create } from "zustand";
import { persist } from "zustand/middleware";
import { appConfig } from "../../lib/env";
import { getOrCreateProfile, updateProfileRow } from "../../lib/supabase/appData.service";
import { getSupabaseClient } from "../../lib/supabase/client";
import type { UserProfile } from "../../types/app";
import type { AuthCredentials, AuthState } from "./auth.types";

const mockUser: UserProfile = {
  id: "mock-user",
  email: "driver@autovision.dev",
  fullName: "AutoVision Driver",
  avatarUrl: null,
  subscriptionPlan: "free",
  stripeCustomerId: null,
  createdAt: new Date().toISOString(),
};

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  signup: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

function toProfile(id: string, email: string, fullName?: string): UserProfile {
  return {
    id,
    email,
    fullName: fullName || email.split("@")[0] || "AutoVision User",
    avatarUrl: null,
    subscriptionPlan: "free",
    stripeCustomerId: null,
    createdAt: new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: appConfig.hasSupabase ? null : mockUser,
      isLoading: false,
      error: null,
      isMockAuth: !appConfig.hasSupabase,
      initialize: async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
          set({ user: get().user ?? mockUser, isLoading: false, isMockAuth: true });
          return;
        }

        set({ isLoading: true, error: null });
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          set({ user: null, isLoading: false, isMockAuth: false });
          return;
        }

        try {
          const profile = await getOrCreateProfile({
            id: data.user.id,
            email: data.user.email ?? "user@autovision.ai",
            fullName: data.user.user_metadata?.full_name,
          });
          set({
            user: profile ?? toProfile(data.user.id, data.user.email ?? "user@autovision.ai", data.user.user_metadata?.full_name),
            isLoading: false,
            isMockAuth: false,
          });
        } catch (profileError) {
          set({
            user: toProfile(data.user.id, data.user.email ?? "user@autovision.ai", data.user.user_metadata?.full_name),
            error: profileError instanceof Error ? profileError.message : "Unable to load profile.",
            isLoading: false,
            isMockAuth: false,
          });
        }
      },
      login: async ({ email, password }) => {
        const supabase = getSupabaseClient();
        set({ isLoading: true, error: null });

        if (!supabase) {
          await new Promise((resolve) => window.setTimeout(resolve, 400));
          set({ user: toProfile("mock-user", email), isLoading: false, isMockAuth: true });
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          set({ error: error?.message ?? "Unable to sign in.", isLoading: false });
          return;
        }

        try {
          const profile = await getOrCreateProfile({
            id: data.user.id,
            email: data.user.email ?? email,
            fullName: data.user.user_metadata?.full_name,
          });
          set({ user: profile ?? toProfile(data.user.id, data.user.email ?? email), isLoading: false, isMockAuth: false });
        } catch (profileError) {
          set({
            user: toProfile(data.user.id, data.user.email ?? email),
            error: profileError instanceof Error ? profileError.message : "Signed in, but profile could not be loaded.",
            isLoading: false,
            isMockAuth: false,
          });
        }
      },
      signup: async ({ email, password, fullName }) => {
        const supabase = getSupabaseClient();
        set({ isLoading: true, error: null });

        if (!supabase) {
          await new Promise((resolve) => window.setTimeout(resolve, 400));
          set({ user: toProfile("mock-user", email, fullName), isLoading: false, isMockAuth: true });
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${appConfig.appUrl}/auth/callback`,
          },
        });
        if (error || !data.user) {
          set({ error: error?.message ?? "Unable to create account.", isLoading: false });
          return;
        }

        if (!data.session) {
          set({
            user: null,
            error: "Check your email to confirm your account, then sign in.",
            isLoading: false,
            isMockAuth: false,
          });
          return;
        }

        try {
          const profile = await getOrCreateProfile({
            id: data.user.id,
            email: data.user.email ?? email,
            fullName,
          });
          set({ user: profile ?? toProfile(data.user.id, data.user.email ?? email, fullName), isLoading: false, isMockAuth: false });
        } catch (profileError) {
          set({
            user: toProfile(data.user.id, data.user.email ?? email, fullName),
            error: profileError instanceof Error ? profileError.message : "Account created, but profile could not be saved.",
            isLoading: false,
            isMockAuth: false,
          });
        }
      },
      logout: async () => {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.auth.signOut();
          set({ user: null, isLoading: false, error: null });
          return;
        }

        set({ user: null, isLoading: false, error: null, isMockAuth: true });
      },
      updateProfile: (profile) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...profile } });
        if (appConfig.hasSupabase) {
          void updateProfileRow(current.id, profile).then((saved) => {
            if (saved) set({ user: saved });
          }).catch((error: unknown) => {
            set({ error: error instanceof Error ? error.message : "Unable to save profile." });
          });
        }
      },
    }),
    {
      name: "autovision-auth",
      partialize: (state) => ({ user: state.user, isMockAuth: state.isMockAuth }),
    },
  ),
);
