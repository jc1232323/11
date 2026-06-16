import { api } from './api';

export type PlanType = 'free' | 'monthly' | 'quarterly' | 'yearly';

export type AdminUser = {
  id: string;
  email: string;
  nickname: string;
  defaultRole: string;
  emailVerified: boolean;
  isAdmin: boolean;
  plan: PlanType;
  planExpiresAt: string | null;
  isPremium: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminStats = {
  users: {
    total: number;
    admins: number;
    verified: number;
    newToday: number;
    activePremium: number;
  };
  chat: {
    sessions: number;
    messages: number;
    userMessages: number;
    messagesToday: number;
  };
  exam: { attempts: number };
  planCounts: Record<PlanType, number>;
  signupTrend: Array<{ date: string; count: number }>;
};

export type UserListResult = {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function getAdminStats() {
  return api<AdminStats>('/admin/stats');
}

export function listAdminUsers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  plan?: string;
}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.pageSize) q.set('pageSize', String(params.pageSize));
  if (params.search) q.set('search', params.search);
  if (params.plan) q.set('plan', params.plan);
  return api<UserListResult>(`/admin/users?${q.toString()}`);
}

export type CreateUserPayload = {
  email: string;
  password: string;
  nickname?: string;
  plan?: PlanType;
  planExpiresAt?: string | null;
  isAdmin?: boolean;
};

export function createAdminUser(payload: CreateUserPayload) {
  return api<AdminUser>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type UpdateUserPayload = {
  nickname?: string;
  plan?: PlanType;
  planExpiresAt?: string | null;
  isAdmin?: boolean;
  password?: string;
};

export function updateAdminUser(id: string, payload: UpdateUserPayload) {
  return api<AdminUser>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminUser(id: string) {
  return api<{ ok: boolean }>(`/admin/users/${id}`, { method: 'DELETE' });
}

export const PLAN_LABELS: Record<PlanType, string> = {
  free: '免费版',
  monthly: '月度会员',
  quarterly: '季度会员',
  yearly: '年度会员',
};
