/**
 * Offering orders, stored on the device per user.
 * Replace with API calls once a backend (and payment) is available.
 */
import * as Crypto from 'expo-crypto';

import type { RelationId } from '@/data/petitions';
import { getItem, setItem } from '@/lib/kv-storage';

/** A person the petition prays for (or, for cầu siêu, a deceased person). */
export type PetitionPerson = {
  id: string;
  name: string;
  birthYear?: string;
  relation: RelationId;
};

export type Petition = {
  typeId: string;
  /** The user who wrote and submitted the petition (snapshot of their name). */
  requesterName: string;
  people: PetitionPerson[];
  address: string;
  wish: string;
};

export type Order = {
  id: string;
  userId: string;
  templeId: string;
  /** Absent when the user only sends a petition. */
  offeringId?: string;
  /** Snapshot at submission time, so later catalog changes don't rewrite history. */
  offeringName?: string;
  total: number;
  /** Absent when the user only makes an offering. */
  petition?: Petition;
  status: 'submitted';
  createdAt: string;
};

export type NewOrder = Omit<Order, 'id' | 'status' | 'createdAt'>;

/** Petitions saved before multi-person support had a single devotee. */
type LegacyPetition = {
  typeId: string;
  devoteeName: string;
  birthYear?: string;
  address: string;
  wish: string;
};

function normalizePetition(p: Petition | LegacyPetition | undefined): Petition | undefined {
  if (!p || 'people' in p) return p;
  return {
    typeId: p.typeId,
    requesterName: p.devoteeName,
    people: [{ id: 'legacy', name: p.devoteeName, birthYear: p.birthYear, relation: 'self' }],
    address: p.address,
    wish: p.wish,
  };
}

const ordersKey = (userId: string) => `vp.orders.${userId}`;

export async function listOrders(userId: string): Promise<Order[]> {
  const raw = await getItem(ordersKey(userId));
  if (!raw) return [];
  return (JSON.parse(raw) as Order[]).map((o) => ({ ...o, petition: normalizePetition(o.petition) }));
}

export async function getOrder(userId: string, orderId: string): Promise<Order | undefined> {
  return (await listOrders(userId)).find((o) => o.id === orderId);
}

export async function createOrder(input: NewOrder): Promise<Order> {
  if (!input.offeringId && !input.petition) {
    throw new Error('An order needs an offering, a petition, or both.');
  }
  const order: Order = {
    ...input,
    id: Crypto.randomUUID(),
    status: 'submitted',
    createdAt: new Date().toISOString(),
  };
  const orders = await listOrders(input.userId);
  // Newest first.
  await setItem(ordersKey(input.userId), JSON.stringify([order, ...orders]));
  return order;
}
