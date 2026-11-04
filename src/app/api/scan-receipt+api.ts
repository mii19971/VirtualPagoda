import { extractReceipt, ReceiptReadError } from '@/server/extract-receipt';

// A 1600px JPEG at 0.7 quality is ~300–600 KB; base64 adds a third.
const MAX_BASE64_LENGTH = 5 * 1024 * 1024;

/** POST { imageBase64 } → ReceiptExtraction, or { error } with a user-facing message. */
export async function POST(request: Request) {
  let imageBase64: unknown;
  try {
    ({ imageBase64 } = await request.json());
  } catch {
    return Response.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 });
  }

  if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
    return Response.json({ error: 'Thiếu ảnh phiếu.' }, { status: 400 });
  }
  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return Response.json({ error: 'Ảnh quá lớn.' }, { status: 413 });
  }

  try {
    return Response.json(await extractReceipt(imageBase64));
  } catch (error) {
    if (error instanceof ReceiptReadError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error('scan-receipt failed', error);
    return Response.json({ error: 'Không đọc được phiếu, vui lòng thử lại.' }, { status: 500 });
  }
}
