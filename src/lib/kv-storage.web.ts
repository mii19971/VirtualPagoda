// expo-sqlite on web needs WASM + cross-origin isolation headers; localStorage is enough here.
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
