/**
 * Key-value storage for app data that is not secret and may be large
 * (order history, petitions). Secrets such as the session stay in `storage.ts`.
 */
import Storage from 'expo-sqlite/kv-store';

export function getItem(key: string): Promise<string | null> {
  return Storage.getItem(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  await Storage.setItem(key, value);
}
