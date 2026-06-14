import { User } from '../entities/user.entity';

/** Check if user has an active premium membership */
export function isPremium(user: User): boolean {
  if (user.plan === 'free') return false;
  if (!user.planExpiresAt) return false;
  return new Date(user.planExpiresAt) > new Date();
}

/** Daily limits for free users */
export const FREE_LIMITS = {
  dailyChatMessages: 5,
  dailyTrainingPacks: 1,
  chatHistoryDays: 7,
};
