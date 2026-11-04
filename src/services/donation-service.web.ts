/**
 * Web build of the donation ledger. expo-sqlite on web needs WASM and cross-origin
 * isolation headers, so this keeps the same API on top of the key-value store.
 */
import * as Crypto from 'expo-crypto';

import { getItem, setItem } from '@/lib/kv-storage';
import { normalizeSearch } from '@/lib/format';
import type { Donation, DonationInput } from '@/services/donation-types';

const KEY = 'vp.donations.v1';

async function readAll(): Promise<Donation[]> {
  const raw = await getItem(KEY);
  return raw ? (JSON.parse(raw) as Donation[]) : [];
}

async function writeAll(list: Donation[]) {
  await setItem(KEY, JSON.stringify(list));
}

function byDateDesc(a: Donation, b: Donation) {
  return b.donationDate.localeCompare(a.donationDate) || b.createdAt.localeCompare(a.createdAt);
}

export async function listDonations(query = ''): Promise<Donation[]> {
  const q = normalizeSearch(query);
  const list = await readAll();
  return list
    .filter((d) => !q || normalizeSearch(`${d.fullName} ${d.address} ${d.receiptNumber}`).includes(q))
    .sort(byDateDesc);
}

export async function getDonation(id: string): Promise<Donation | undefined> {
  return (await readAll()).find((d) => d.id === id);
}

export async function createDonation(input: DonationInput, recordedBy: string): Promise<Donation> {
  const now = new Date().toISOString();
  const donation: Donation = { ...input, id: Crypto.randomUUID(), recordedBy, createdAt: now, updatedAt: now };
  await writeAll([donation, ...(await readAll())]);
  return donation;
}

export async function updateDonation(id: string, input: DonationInput): Promise<void> {
  const now = new Date().toISOString();
  await writeAll((await readAll()).map((d) => (d.id === id ? { ...d, ...input, updatedAt: now } : d)));
}

export async function deleteDonation(id: string): Promise<void> {
  await writeAll((await readAll()).filter((d) => d.id !== id));
}

export async function findPossibleDuplicate(
  input: Pick<DonationInput, 'fullName' | 'amount' | 'donationDate'>,
  excludeId?: string,
): Promise<Donation | undefined> {
  const name = input.fullName.trim().toLowerCase();
  return (await readAll()).find(
    (d) =>
      d.id !== excludeId &&
      d.donationDate === input.donationDate &&
      d.amount === input.amount &&
      d.fullName.trim().toLowerCase() === name,
  );
}
