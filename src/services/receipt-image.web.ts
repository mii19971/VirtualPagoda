// The web build has no persistent file system: photos are read but not kept (blob URLs
// die with the tab, and browser storage is too small for images).
export async function persistReceiptImage(_uri: string): Promise<string | undefined> {
  return undefined;
}

export function deleteReceiptImage(_uri: string | undefined): void {}
