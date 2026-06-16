const API_BASE = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string | string[] }).message ?? '请求失败';
    const text = Array.isArray(msg) ? msg.join('，') : String(msg);
    throw new ApiError(text, res.status);
  }
  return data as T;
}

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
  isAdmin: boolean;
  plan: 'free' | 'monthly' | 'quarterly' | 'yearly';
};

export function login(email: string, password: string) {
  return api<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function fetchMe() {
  return api<{ user: AuthUser | null }>('/auth/me');
}

export function logoutRequest() {
  return api('/auth/logout', { method: 'POST' });
}
