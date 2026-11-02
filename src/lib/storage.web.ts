// expo-secure-store has no web implementation, so fall back to localStorage.
// localStorage is unavailable during server rendering (web output: "server").
function getStorage(): Storage | null {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

export async function getItem(key: string): Promise<string | null> {
  return getStorage()?.getItem(key) ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  getStorage()?.setItem(key, value);
}

export async function removeItem(key: string): Promise<void> {
  getStorage()?.removeItem(key);
}
