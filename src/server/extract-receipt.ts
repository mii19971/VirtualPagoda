/**
 * Reads a photographed "phiếu công đức" with the Gemini API and returns its fields.
 * Server-only: import this from `+api.ts` routes, never from app code, so the API key
 * stays out of the client bundle.
 */
import type { ReceiptExtraction, ReceiptField } from '@/services/donation-types';

const DEFAULT_MODEL = 'gemini-3.6-flash';
const TIMEOUT_MS = 60_000;

const FIELDS: ReceiptField[] = [
  'receiptNumber',
  'fullName',
  'address',
  'birthYear',
  'amount',
  'amountInWords',
  'donationDate',
  'note',
];

// Unknown values come back as "" or 0 so the schema needs no nullable types.
const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    isReceipt: {
      type: 'boolean',
      description: 'false if the photo is not a donation receipt or is unreadable',
    },
    receiptNumber: { type: 'string', description: 'Số phiếu / quyển số, "" if absent' },
    fullName: { type: 'string', description: 'Họ tên người công đức, "" if absent' },
    address: { type: 'string', description: 'Địa chỉ, "" if absent' },
    birthYear: { type: 'integer', description: 'Năm sinh dương lịch (4 digits), 0 if absent' },
    amount: { type: 'integer', description: 'Số tiền công đức in VND, 0 if absent' },
    amountInWords: { type: 'string', description: 'Số tiền viết bằng chữ, "" if absent' },
    donationDate: { type: 'string', description: 'Ngày công đức as YYYY-MM-DD, "" if absent' },
    note: { type: 'string', description: 'Other content (hiện vật, lời cầu nguyện...), "" if none' },
    uncertainFields: {
      type: 'array',
      items: { type: 'string', enum: FIELDS },
      description: 'Fields that are hard to read, ambiguous, or inconsistent',
    },
  },
  required: ['isReceipt', ...FIELDS, 'uncertainFields'],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You read handwritten Vietnamese donation receipts ("phiếu công đức") photographed at temples and pagodas, so staff don't have to copy them into a ledger by hand.

Transcribe exactly what is written, keeping Vietnamese diacritics. Do not guess or invent text: when a word is illegible, give your best reading and list the field in uncertainFields. A staff member reviews every result against the photo, so marking a field uncertain is always better than a confident wrong value.

Field notes:
- fullName: the donor's name as written, including prefixes like "Gia đình", "Ông", "Bà" if present.
- birthYear: convert a two-digit year to four digits (e.g. "85" → 1985). If only a lunar year name is written (e.g. "Giáp Tý"), leave 0 and put it in note.
- amount: an integer number of đồng. Expand shorthand such as "500k", "500.000đ", "1tr", "1.5 triệu". If the figure and the amount written in words disagree, use the figure and mark both amount and amountInWords uncertain.
- donationDate: convert to YYYY-MM-DD. If the date is written in the lunar calendar ("âm lịch"), leave it "" and put the lunar date in note.
- note: anything else meaningful on the receipt (in-kind donations, the purpose of the donation, wishes).`;

export class ReceiptReadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string; status?: string };
};

export async function extractReceipt(imageBase64: string): Promise<ReceiptExtraction> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ReceiptReadError('Máy chủ chưa cấu hình GEMINI_API_KEY.', 500);
  }
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Header rather than `?key=` so the key never shows up in URL/proxy logs.
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
              { text: 'Đọc phiếu công đức này.' },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseJsonSchema: OUTPUT_SCHEMA,
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error('Gemini request failed', error);
    throw new ReceiptReadError('Không kết nối được dịch vụ đọc phiếu.', 503);
  }

  const body = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    console.error('Gemini API error', response.status, body.error?.status, body.error?.message);
    if (response.status === 429) {
      throw new ReceiptReadError('Hệ thống đang bận, vui lòng thử lại sau ít phút.', 429);
    }
    if (response.status === 401 || response.status === 403) {
      throw new ReceiptReadError('API key của dịch vụ đọc phiếu không hợp lệ.', 500);
    }
    if (response.status === 400 && /API key/i.test(body.error?.message ?? '')) {
      throw new ReceiptReadError('API key của dịch vụ đọc phiếu không hợp lệ.', 500);
    }
    if (response.status === 404) {
      throw new ReceiptReadError(`Không tìm thấy model "${model}".`, 500);
    }
    throw new ReceiptReadError('Không đọc được phiếu, vui lòng thử lại.', 502);
  }

  if (body.promptFeedback?.blockReason) {
    throw new ReceiptReadError('Không đọc được nội dung ảnh này.', 422);
  }
  const candidate = body.candidates?.[0];
  const text = candidate?.content?.parts
    ?.filter((p) => !p.thought && p.text)
    .map((p) => p.text)
    .join('');
  if (candidate?.finishReason !== 'STOP' || !text) {
    console.error('Gemini finished without a result', candidate?.finishReason);
    throw new ReceiptReadError('Không đọc được phiếu, vui lòng thử lại.', 502);
  }

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text) as Record<string, unknown>;
  } catch {
    console.error('Gemini returned invalid JSON', text.slice(0, 200));
    throw new ReceiptReadError('Không đọc được phiếu, vui lòng thử lại.', 502);
  }
  if (raw.isReceipt !== true) {
    throw new ReceiptReadError('Ảnh không phải phiếu công đức hoặc quá mờ, vui lòng chụp lại.', 422);
  }
  return normalize(raw);
}

function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function int(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 0;
}

function normalize(raw: Record<string, unknown>): ReceiptExtraction {
  const uncertain = new Set(
    (Array.isArray(raw.uncertainFields) ? raw.uncertainFields : []).filter(
      (f): f is ReceiptField => FIELDS.includes(f as ReceiptField),
    ),
  );

  const currentYear = new Date().getFullYear();
  let birthYear = int(raw.birthYear);
  if (birthYear && (birthYear < 1900 || birthYear > currentYear)) {
    uncertain.add('birthYear');
    birthYear = 0;
  }

  const amount = int(raw.amount);
  if (amount <= 0) uncertain.add('amount');

  let donationDate = str(raw.donationDate);
  if (donationDate && !/^\d{4}-\d{2}-\d{2}$/.test(donationDate)) {
    uncertain.add('donationDate');
    donationDate = '';
  }

  const fullName = str(raw.fullName);
  if (!fullName) uncertain.add('fullName');

  return {
    receiptNumber: str(raw.receiptNumber),
    fullName,
    address: str(raw.address),
    birthYear: birthYear || undefined,
    amount: amount > 0 ? amount : undefined,
    amountInWords: str(raw.amountInWords),
    donationDate,
    note: str(raw.note),
    uncertainFields: [...uncertain],
  };
}
