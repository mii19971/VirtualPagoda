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
  email: string;
  createdAt: string;
};

type StoredAccount = User & {
  salt: string;
  passwordHash: string;
};

const SESSION_KEY = 'vp.session';

export class AuthError extends Error {}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hashPassword(password: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

// One storage entry per account keeps each value small (SecureStore limits value size).
async function accountKey(email: string) {
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, email);
  return `vp.account.${digest}`;
}

async function findAccount(email: string): Promise<StoredAccount | null> {
  const raw = await getItem(await accountKey(email));
  return raw ? (JSON.parse(raw) as StoredAccount) : null;
}

function toUser({ id, name, email, createdAt }: StoredAccount): User {
  return { id, name, email, createdAt };
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const normalizedEmail = normalizeEmail(email);
  if (await findAccount(normalizedEmail)) {
    throw new AuthError('Email này đã được đăng ký.');
  }

  const salt = toHex(Crypto.getRandomBytes(16));
  const account: StoredAccount = {
    id: Crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
    salt,
    passwordHash: await hashPassword(password, salt),
  };
  await setItem(await accountKey(normalizedEmail), JSON.stringify(account));

  const user = toUser(account);
  await setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function login(email: string, password: string): Promise<User> {
  const account = await findAccount(normalizeEmail(email));
  if (!account || (await hashPassword(password, account.salt)) !== account.passwordHash) {
    throw new AuthError('Email hoặc mật khẩu không đúng.');
  }

  const user = toUser(account);
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
