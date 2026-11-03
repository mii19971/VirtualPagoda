/**
 * Local auth service: accounts and the session are stored on the device.
 * Swap these functions for real API calls once a backend is available —
 * the rest of the app only depends on their signatures.
 */
import * as Crypto from 'expo-crypto';

import { getItem, removeItem, setItem } from '@/lib/storage';

export type User = {
  id: string;
  name: string;
  /** E.164 format, e.g. "+84912345678". */
  phone: string;
  createdAt: string;
};

type StoredAccount = User & {
  salt: string;
  passwordHash: string;
};

// v2: accounts are keyed by phone number (v1 used email), so old sessions are ignored.
const SESSION_KEY = 'vp.session.v2';

export class AuthError extends Error {}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hashPassword(password: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

// One storage entry per account keeps each value small (SecureStore limits value size).
async function accountKey(phone: string) {
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, phone);
  return `vp.account.v2.${digest}`;
}

async function findAccount(phone: string): Promise<StoredAccount | null> {
  const raw = await getItem(await accountKey(phone));
  return raw ? (JSON.parse(raw) as StoredAccount) : null;
}

function toUser({ id, name, phone, createdAt }: StoredAccount): User {
  return { id, name, phone, createdAt };
}

/** `phone` must already be in E.164 format (see `toE164`). */
export async function register(name: string, phone: string, password: string): Promise<User> {
  if (await findAccount(phone)) {
    throw new AuthError('Số điện thoại này đã được đăng ký.');
  }

  const salt = toHex(Crypto.getRandomBytes(16));
  const account: StoredAccount = {
    id: Crypto.randomUUID(),
    name: name.trim(),
    phone,
    createdAt: new Date().toISOString(),
    salt,
    passwordHash: await hashPassword(password, salt),
  };
  await setItem(await accountKey(phone), JSON.stringify(account));

  const user = toUser(account);
  await setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

/** `phone` must already be in E.164 format (see `toE164`). */
export async function login(phone: string, password: string): Promise<User> {
  const account = await findAccount(phone);
  if (!account || (await hashPassword(password, account.salt)) !== account.passwordHash) {
    throw new AuthError('Số điện thoại hoặc mật khẩu không đúng.');
  }

  const user = toUser(account);
  await setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export type ProfileChanges = {
  name: string;
  /** E.164 format. */
  phone: string;
  /** Current password; required only when the phone number changes. */
  password?: string;
};

export async function updateProfile(current: User, changes: ProfileChanges): Promise<User> {
  const account = await findAccount(current.phone);
  if (!account || account.id !== current.id) {
    throw new AuthError('Không tìm thấy tài khoản, vui lòng đăng nhập lại.');
  }

  const phoneChanged = changes.phone !== account.phone;
  if (phoneChanged) {
    // The phone number is the login ID, so changing it requires proving account ownership.
    if (!changes.password || (await hashPassword(changes.password, account.salt)) !== account.passwordHash) {
      throw new AuthError('Mật khẩu hiện tại không đúng.');
    }
    if (await findAccount(changes.phone)) {
      throw new AuthError('Số điện thoại này đã được dùng cho tài khoản khác.');
    }
  }

  const updated: StoredAccount = { ...account, name: changes.name.trim(), phone: changes.phone };
  // Write the new entry before deleting the old one so a failure never loses the account.
  await setItem(await accountKey(updated.phone), JSON.stringify(updated));
  if (phoneChanged) {
    await removeItem(await accountKey(account.phone));
  }

  const user = toUser(updated);
  await setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function logout(): Promise<void> {
  await removeItem(SESSION_KEY);
}

export async function getSessionUser(): Promise<User | null> {
  const raw = await getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}
