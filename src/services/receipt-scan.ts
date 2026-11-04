import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { ReceiptExtraction } from '@/services/donation-types';

/** Long enough edge for handwriting to stay legible, small enough to upload quickly. */
const MAX_EDGE = 1600;

export type ReceiptPhoto = { uri: string; base64: string };

export class ReceiptScanError extends Error {}

/** Opens the camera (or the photo library) and returns a resized JPEG, or null if cancelled. */
export async function pickReceiptPhoto(source: 'camera' | 'library'): Promise<ReceiptPhoto | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new ReceiptScanError('Cần cấp quyền camera để chụp phiếu.');
    }
  }

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: 'images', quality: 1 };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return null;

  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_EDGE) {
    context.resize(asset.width >= asset.height ? { width: MAX_EDGE } : { height: MAX_EDGE });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.7,
    base64: true,
  });
  if (!saved.base64) throw new ReceiptScanError('Không xử lý được ảnh, vui lòng thử lại.');
  return { uri: saved.uri, base64: saved.base64 };
}

/** Sends the photo to the server, which reads it with Claude. */
export async function readReceipt(photo: ReceiptPhoto): Promise<ReceiptExtraction> {
  let response: Response;
  try {
    response = await fetch('/api/scan-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: photo.base64 }),
    });
  } catch {
    throw new ReceiptScanError('Không có kết nối mạng. Bạn vẫn có thể nhập tay rồi lưu.');
  }

  const body = (await response.json().catch(() => null)) as
    | (ReceiptExtraction & { error?: undefined })
    | { error: string }
    | null;
  if (!response.ok || !body || body.error !== undefined) {
    throw new ReceiptScanError(body?.error ?? 'Không đọc được phiếu, vui lòng thử lại.');
  }
  return body;
}
