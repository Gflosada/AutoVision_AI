import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockUsage } from "../data/mockUsage";
import { getOrCreateUsageLimit, hasSupabaseData, incrementUsageLimit } from "../lib/supabase/appData.service";
import type { UsageLimit } from "../types/app";
import type { SubscriptionPlan } from "../types/subscription";

interface UsageStore {
  usage: UsageLimit;
  isLoading: boolean;
  error: string | null;
  loadForUser: (userId: string, plan?: SubscriptionPlan) => Promise<void>;
  canGenerate: () => boolean;
  consumeGeneration: () => Promise<boolean>;
  setUsage: (usage: UsageLimit) => void;
}

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      usage: mockUsage,
      isLoading: false,
      error: null,
      loadForUser: async (userId, plan = "free") => {
        if (!hasSupabaseData()) return;
        set({ isLoading: true, error: null });
        try {
          const usage = await getOrCreateUsageLimit(userId, plan);
          if (usage) set({ usage, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to load usage.", isLoading: false });
        }
      },
      canGenerate: () => get().usage.monthlyUsed < get().usage.monthlyLimit,
      consumeGeneration: async () => {
        const usage = get().usage;
        if (usage.monthlyUsed >= usage.monthlyLimit) return false;
        const optimistic = { ...usage, monthlyUsed: usage.monthlyUsed + 1 };
        set({ usage: optimistic });
        if (hasSupabaseData()) {
          try {
            const saved = await incrementUsageLimit(usage);
            if (saved) set({ usage: saved });
          } catch (error) {
            set({ usage, error: error instanceof Error ? error.message : "Unable to update usage." });
            return false;
          }
        }
        return true;
      },
      setUsage: (usage) => set({ usage }),
    }),
    { name: "autovision-usage" },
  ),
);
