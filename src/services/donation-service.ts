/**
 * The donation ledger ("sổ công đức"), stored in SQLite on the device.
 * It belongs to the temple, not to one staff member, so it is shared by every account
 * on this device; `recordedBy` keeps track of who entered each row.
 */
import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';

import { normalizeSearch } from '@/lib/format';
import type { Donation, DonationInput } from '@/services/donation-types';

type Row = {
  id: string;
  receipt_number: string;
  full_name: string;
  address: string;
  birth_year: number | null;
  amount: number;
  amount_in_words: string;
  donation_date: string;
  note: string;
  image_uri: string | null;
  extraction_json: string | null;
  recorded_by: string;
  created_at: string;
  updated_at: string;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | undefined;

function getDb() {
  dbPromise ??= (async () => {
    const db = await SQLite.openDatabaseAsync('donations.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY NOT NULL,
        receipt_number TEXT NOT NULL DEFAULT '',
        full_name TEXT NOT NULL,
        address TEXT NOT NULL DEFAULT '',
        birth_year INTEGER,
        amount INTEGER NOT NULL,
        amount_in_words TEXT NOT NULL DEFAULT '',
        donation_date TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        image_uri TEXT,
        extraction_json TEXT,
        search_text TEXT NOT NULL DEFAULT '',
        recorded_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS donations_date ON donations (donation_date DESC, created_at DESC);
    `);
    return db;
  })();
  return dbPromise;
}

function toDonation(r: Row): Donation {
  return {
    id: r.id,
    receiptNumber: r.receipt_number,
    fullName: r.full_name,
    address: r.address,
    birthYear: r.birth_year ?? undefined,
    amount: r.amount,
    amountInWords: r.amount_in_words,
    donationDate: r.donation_date,
    note: r.note,
    imageUri: r.image_uri ?? undefined,
    extractionJson: r.extraction_json ?? undefined,
    recordedBy: r.recorded_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function searchText(d: DonationInput) {
  return normalizeSearch([d.fullName, d.address, d.receiptNumber].join(' '));
}

/** Newest donation date first; `query` matches name, address or receipt number, accent-insensitive. */
export async function listDonations(query = ''): Promise<Donation[]> {
  const db = await getDb();
  const q = normalizeSearch(query);
  const rows = q
    ? await db.getAllAsync<Row>(
        `SELECT * FROM donations WHERE search_text LIKE ? ESCAPE '\\'
         ORDER BY donation_date DESC, created_at DESC`,
        `%${q.replace(/[\\%_]/g, '\\$&')}%`,
      )
    : await db.getAllAsync<Row>('SELECT * FROM donations ORDER BY donation_date DESC, created_at DESC');
  return rows.map(toDonation);
}

export async function getDonation(id: string): Promise<Donation | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM donations WHERE id = ?', id);
  return row ? toDonation(row) : undefined;
}

export async function createDonation(input: DonationInput, recordedBy: string): Promise<Donation> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = Crypto.randomUUID();
  await db.runAsync(
    `INSERT INTO donations (id, receipt_number, full_name, address, birth_year, amount,
       amount_in_words, donation_date, note, image_uri, extraction_json, search_text,
       recorded_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.receiptNumber,
    input.fullName,
    input.address,
    input.birthYear ?? null,
    input.amount,
    input.amountInWords,
    input.donationDate,
    input.note,
    input.imageUri ?? null,
    input.extractionJson ?? null,
    searchText(input),
    recordedBy,
    now,
    now,
  );
  return { ...input, id, recordedBy, createdAt: now, updatedAt: now };
}

export async function updateDonation(id: string, input: DonationInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE donations SET receipt_number = ?, full_name = ?, address = ?, birth_year = ?,
       amount = ?, amount_in_words = ?, donation_date = ?, note = ?, search_text = ?, updated_at = ?
     WHERE id = ?`,
    input.receiptNumber,
    input.fullName,
    input.address,
    input.birthYear ?? null,
    input.amount,
    input.amountInWords,
    input.donationDate,
    input.note,
    searchText(input),
    new Date().toISOString(),
    id,
  );
}

export async function deleteDonation(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM donations WHERE id = ?', id);
}

/** Same-name, same-amount entries on the same day usually mean a receipt was photographed twice. */
export async function findPossibleDuplicate(
  input: Pick<DonationInput, 'fullName' | 'amount' | 'donationDate'>,
  excludeId?: string,
): Promise<Donation | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>(
    `SELECT * FROM donations WHERE donation_date = ? AND amount = ? AND lower(full_name) = lower(?)
       AND id != ? LIMIT 1`,
    input.donationDate,
    input.amount,
    input.fullName.trim(),
    excludeId ?? '',
  );
  return row ? toDonation(row) : undefined;
}
