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
  { id: 'cau-sieu', name: 'Cầu siêu', prayer: 'hương linh người đã khuất sớm được siêu thoát' },
];

export function getPetitionType(id: string | undefined): PetitionType | undefined {
  return PETITION_TYPES.find((p) => p.id === id);
}
