export type PetitionType = {
  id: string;
  name: string;
  /** What the devotee prays for; used inside the generated petition text. */
  prayer: string;
};

export const PETITION_TYPES: PetitionType[] = [
  { id: 'cau-an', name: 'Cầu an', prayer: 'gia đạo bình an, mọi sự hanh thông' },
  { id: 'suc-khoe', name: 'Cầu sức khỏe', prayer: 'thân tâm an lạc, bệnh tật tiêu trừ' },
  { id: 'tai-loc', name: 'Cầu tài lộc', prayer: 'công việc thuận lợi, tài lộc dồi dào' },
  { id: 'hoc-hanh', name: 'Cầu học hành', prayer: 'học hành tấn tới, thi cử đỗ đạt' },
  { id: 'duyen', name: 'Cầu duyên', prayer: 'nhân duyên tốt đẹp, gia đạo êm ấm' },
  { id: 'giai-han', name: 'Giải hạn', prayer: 'tiêu tai giải hạn, gặp dữ hóa lành' },
  { id: 'cau-sieu', name: 'Cầu siêu', prayer: 'sớm được siêu thoát, vãng sinh về cõi an lành' },
];

/** In a cầu siêu petition the listed people are the deceased (hương linh), not the living. */
export const MEMORIAL_TYPE_ID = 'cau-sieu';

export function getPetitionType(id: string | undefined): PetitionType | undefined {
  return PETITION_TYPES.find((p) => p.id === id);
}

/** Relationship of a listed person to the user writing the petition. */
export const RELATIONS = [
  { id: 'self', label: 'Bản thân' },
  { id: 'father', label: 'Bố' },
  { id: 'mother', label: 'Mẹ' },
  { id: 'spouse', label: 'Vợ/Chồng' },
  { id: 'child', label: 'Con' },
  { id: 'sibling', label: 'Anh/Chị/Em' },
  { id: 'grandparent', label: 'Ông/Bà' },
  { id: 'grandchild', label: 'Cháu' },
  { id: 'friend', label: 'Bạn bè' },
  { id: 'other', label: 'Khác' },
] as const;

export type RelationId = (typeof RELATIONS)[number]['id'];

export function relationLabel(id: RelationId): string {
  return RELATIONS.find((r) => r.id === id)?.label ?? '';
}
