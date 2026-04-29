import type { UsageLimit } from "../types/app";

export const mockUsage: UsageLimit = {
  id: "usage_mock_user",
  userId: "mock-user",
  plan: "free",
  monthlyLimit: 3,
  monthlyUsed: 1,
  resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
};
