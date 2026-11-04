/** Keeps receipt photos in the app's document directory (the picker's cache copy can be purged). */
import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';

function receiptsDir() {
  const dir = new Directory(Paths.document, 'receipts');
  dir.create({ idempotent: true, intermediates: true });
  return dir;
}

export async function persistReceiptImage(uri: string): Promise<string | undefined> {
  const destination = new File(receiptsDir(), `${Crypto.randomUUID()}.jpg`);
  await new File(uri).copy(destination);
  return destination.uri;
}

export function deleteReceiptImage(uri: string | undefined): void {
  if (!uri) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}
