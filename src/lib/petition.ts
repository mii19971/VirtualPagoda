import { getPetitionType } from '@/data/petitions';
import type { Temple } from '@/data/temples';
import { canChiOfYear, formatLunarDate, lunarDateOf } from '@/lib/lunar';
import type { Petition } from '@/services/order-service';

/** Builds a simplified traditional petition (sớ) text from the form, dated by the lunar calendar. */
export function buildPetitionText(petition: Petition, temple: Temple, dateIso: string): string {
  const date = new Date(dateIso);
  const lunar = lunarDateOf(date);
  const type = getPetitionType(petition.typeId);
  const opening =
    temple.kind === 'chua'
      ? 'Nam mô A Di Đà Phật! (3 lần)\nCon kính lạy chư Phật mười phương, chư vị Bồ Tát, chư Hiền Thánh Tăng.'
      : 'Con lạy chín phương Trời, mười phương Chư Phật.\nCon kính lạy Đức Thánh, chư vị Tôn thần cai quản trong ' +
        `${temple.name}.`;

  const birthYear = Number(petition.birthYear);
  const devotee =
    petition.birthYear && Number.isInteger(birthYear) && birthYear >= 1900
      ? `${petition.devoteeName}, sinh năm ${birthYear} (tuổi ${canChiOfYear(birthYear)})`
      : petition.devoteeName;

  return [
    opening,
    '',
    `Hôm nay là ${formatLunarDate(lunar)}.`,
    `(Tức ngày ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} dương lịch)`,
    `Tín chủ con là: ${devotee}.`,
    `Ngụ tại: ${petition.address}.`,
    '',
    `Thành tâm kính dâng sớ ${type?.name.toLowerCase() ?? ''} tại ${temple.name}, ` +
      `cúi xin chứng giám lòng thành, phù hộ độ trì cho ${type?.prayer ?? 'mọi sự tốt lành'}.`,
    petition.wish ? `\nLời nguyện: ${petition.wish}` : '',
    '',
    'Chúng con lễ bạc tâm thành, cúi xin chứng giám.',
  ]
    .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
    .join('\n');
}
