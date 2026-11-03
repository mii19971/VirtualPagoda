/**
 * Offering orders, stored on the device per user.
 * Replace with API calls once a backend (and payment) is available.
 */
import * as Crypto from 'expo-crypto';

import { getItem, setItem } from '@/lib/kv-storage';

export type Petition = {
  typeId: string;
  devoteeName: string;
  birthYear?: string;
  address: string;
  wish: string;
};

export type Order = {
  id: string;
  userId: string;
  templeId: string;
  /** Absent when the user only sends a petition. */
  offeringId?: string;
  /** Price snapshot at submission time, so later price changes don't rewrite history. */
  offeringName?: string;
  total: number;
  petition?: Petition;
  status: 'submitted';
  createdAt: string;
};

export type NewOrder = Omit<Order, 'id' | 'status' | 'createdAt'>;

const ordersKey = (userId: string) => `vp.orders.${userId}`;

export async function listOrders(userId: string): Promise<Order[]> {
  const raw = await getItem(ordersKey(userId));
  return raw ? (JSON.parse(raw) as Order[]) : [];
}

export async function getOrder(userId: string, orderId: string): Promise<Order | undefined> {
  return (await listOrders(userId)).find((o) => o.id === orderId);
}

export async function createOrder(input: NewOrder): Promise<Order> {
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
