import type { User } from './api';

/** Check if user has an active premium plan */
export function isPremium(user: User | null): boolean {
  if (!user) return false;
  if (user.plan === 'free') return false;
  if (!user.planExpiresAt) return false;
  return new Date(user.planExpiresAt) > new Date();
}

export const FREE_LIMITS = {
  dailyChatMessages: 5,
  dailyTrainingPacks: 1,
  chatHistoryDays: 7,
};
