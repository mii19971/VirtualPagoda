import type { Temple, TempleKind } from './temples';

export type Offering = {
  id: string;
  name: string;
  description: string;
  items: string[];
  /** Reference price in VND. */
  price: number;
  /** Places where this offering is appropriate. Meat offerings are never placed at a Buddha altar. */
  kinds: TempleKind[];
};

const ALL: TempleKind[] = ['chua', 'den', 'phu', 'mieu'];
const SHRINES: TempleKind[] = ['den', 'phu', 'mieu'];

export const OFFERINGS: Offering[] = [
  {
    id: 'chay-co-ban',
    name: 'Lễ chay cơ bản',
    description: 'Lễ giản dị, thành tâm dâng hương ngày rằm, mùng một.',
    items: ['Hương', 'Hoa tươi', 'Đĩa hoa quả', 'Nến'],
    price: 200_000,
    kinds: ALL,
  },
  {
    id: 'chay-day-du',
    name: 'Lễ chay đầy đủ',
    description: 'Mâm lễ chay trang trọng dâng lên ban Phật, ban Thánh.',
    items: ['Hương', 'Hoa sen hoặc hoa huệ', 'Mâm ngũ quả', 'Oản', 'Xôi chè', 'Nến'],
    price: 500_000,
    kinds: ALL,
  },
  {
    id: 'cau-an',
    name: 'Lễ cầu an',
    description: 'Cầu bình an, sức khỏe cho bản thân và gia đình, kèm thắp đèn cầu an.',
    items: ['Mâm lễ chay đầy đủ', 'Đèn cầu an', 'Trà, bánh', 'Lễ sớ cầu an'],
    price: 900_000,
    kinds: ALL,
  },
  {
    id: 'le-man',
    name: 'Lễ mặn',
    description: 'Dâng tại ban Thánh, ban Công đồng (không dâng lên ban Phật).',
    items: ['Gà luộc', 'Xôi', 'Rượu', 'Trầu cau', 'Hương, hoa, quả'],
    price: 1_200_000,
    kinds: SHRINES,
  },
  {
    id: 'le-mau',
    name: 'Lễ dâng Mẫu',
    description: 'Lễ dâng Thánh Mẫu, cầu tài lộc, bình an.',
    items: ['Hoa quả', 'Trầu cau', 'Rượu', 'Oản', 'Bánh kẹo', 'Hương, nến'],
    price: 1_500_000,
    kinds: ['phu', 'mieu', 'den'],
  },
];

export function offeringsFor(temple: Temple): Offering[] {
  return OFFERINGS.filter((o) => o.kinds.includes(temple.kind));
}

export function getOffering(id: string | undefined): Offering | undefined {
  return OFFERINGS.find((o) => o.id === id);
}
