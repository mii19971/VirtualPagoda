/**
 * Auth service backed by LocalTempleAPI (ASP.NET Core, see ../LocalTempleAPI).
 * The session (JWT + user) is kept on the device; accounts live on the server.
 * The rest of the app only depends on these functions' signatures.
 */
import { getItem, removeItem, setItem } from '@/lib/storage';

export type User = {
  id: string;
  name: string;
  /** E.164 format, e.g. "+84912345678". */
  phone: string;
  createdAt: string;
  /** Guest session: signed in by phone number only, no password. */
  isGuest?: boolean;
};

type Session = {
  token: string;
  user: User;
};

type AuthResponse = Session & { expiresAt: string };

// v3: sessions come from the API (v2 were local-only accounts), so old sessions are ignored.
const SESSION_KEY = 'vp.session.v3';

/** e.g. "http://192.168.1.10:5028" — a phone cannot reach the dev machine through "localhost". */
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5028').replace(/\/+$/, '');

/** An error whose message is safe to show to the user. */
export class AuthError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/auth${path}`, {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new AuthError('Không kết nối được máy chủ, vui lòng kiểm tra mạng và thử lại.');
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    const message =
      body?.message ??
      (response.status === 401
        ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'
        : 'Có lỗi xảy ra, vui lòng thử lại.');
    throw new AuthError(message, response.status);
  }
  return (await response.json()) as T;
}

async function readSession(): Promise<Session | null> {
  const raw = await getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

async function saveSession({ token, user }: Session): Promise<User> {
  await setItem(SESSION_KEY, JSON.stringify({ token, user } satisfies Session));
  return user;
}

/** JWT for calling other protected API endpoints, or null when signed out. */
export async function getAuthToken(): Promise<string | null> {
  return (await readSession())?.token ?? null;
}

/** `phone` must already be in E.164 format (see `toE164`). */
export async function register(name: string, phone: string, password: string): Promise<User> {
  const session = await request<AuthResponse>('/register', {
    method: 'POST',
    body: JSON.stringify({ name: name.trim(), phone, password }),
  });
  return saveSession(session);
}

/** `phone` must already be in E.164 format (see `toE164`). */
export async function login(phone: string, password: string): Promise<User> {
  const session = await request<AuthResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
  return saveSession(session);
}

/**
 * Guest sign-in by phone number only, no password.
 * A phone number seen for the first time automatically becomes a new guest account
 * named after that number; later sign-ins with the same number return to that account.
 * `phone` must already be in E.164 format (see `toE164`).
 */
export async function loginAsGuest(phone: string): Promise<User> {
  const session = await request<AuthResponse>('/guest', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
  return saveSession(session);
}

export type ProfileChanges = {
  name: string;
  /** E.164 format. */
  phone: string;
  /** Current password; required only when the phone number changes. */
  password?: string;
};

export async function updateProfile(current: User, changes: ProfileChanges): Promise<User> {
  const session = await readSession();
  if (!session || session.user.id !== current.id) {
    throw new AuthError('Không tìm thấy tài khoản, vui lòng đăng nhập lại.');
  }

  const user = await request<User>('/profile', {
    method: 'PUT',
    token: session.token,
    body: JSON.stringify({ name: changes.name.trim(), phone: changes.phone, password: changes.password }),
  });
  return saveSession({ token: session.token, user });
}

export async function logout(): Promise<void> {
  await removeItem(SESSION_KEY);
}

/**
 * The signed-in user, refreshed from the server when it is reachable.
 * An expired or revoked session signs out; when offline the cached user is kept.
 */
export async function getSessionUser(): Promise<User | null> {
  const session = await readSession();
  if (!session) return null;

  try {
    const user = await request<User>('/me', { token: session.token });
    return saveSession({ token: session.token, user });
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      await logout();
      return null;
    }
    return session.user;
  }
}
