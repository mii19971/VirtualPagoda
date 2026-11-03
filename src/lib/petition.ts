import { MEMORIAL_TYPE_ID, getPetitionType, relationLabel } from '@/data/petitions';
import type { Temple } from '@/data/temples';
import { canChiOfYear, formatLunarDate, lunarDateOf } from '@/lib/lunar';
import type { Petition, PetitionPerson } from '@/services/order-service';

function validYear(value: string | undefined): number | undefined {
  const year = Number(value);
  return value && Number.isInteger(year) && year >= 1900 ? year : undefined;
}

/** "Nguyễn Văn B (bố), sinh năm 1960, tuổi Canh Tý" */
function describePerson(person: PetitionPerson, withRelation: boolean): string {
  const parts = [person.name || '…'];
  if (withRelation && person.relation !== 'self') {
    parts[0] += ` (${relationLabel(person.relation).toLowerCase()})`;
  }
  const year = validYear(person.birthYear);
  if (year) parts.push(`sinh năm ${year}, tuổi ${canChiOfYear(year)}`);
  return parts.join(', ');
}

/** Builds a simplified traditional petition (sớ) text from the form, dated by the lunar calendar. */
export function buildPetitionText(petition: Petition, temple: Temple, dateIso: string): string {
  const date = new Date(dateIso);
  const type = getPetitionType(petition.typeId);
  const prayer = type?.prayer ?? 'mọi sự tốt lành';
  const address = petition.address || '…';
  const opening =
    temple.kind === 'chua'
      ? 'Nam mô A Di Đà Phật! (3 lần)\nCon kính lạy chư Phật mười phương, chư vị Bồ Tát, chư Hiền Thánh Tăng.'
      : 'Con lạy chín phương Trời, mười phương Chư Phật.\nCon kính lạy Đức Thánh, chư vị Tôn thần cai quản trong ' +
        `${temple.name}.`;

  const lines = [
    opening,
    '',
    `Hôm nay là ${formatLunarDate(lunarDateOf(date))}.`,
    `(Tức ngày ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} dương lịch)`,
  ];

  if (petition.typeId === MEMORIAL_TYPE_ID) {
    // The requester prays for the listed deceased.
    lines.push(
      `Tín chủ con là: ${petition.requesterName || '…'}.`,
      `Ngụ tại: ${address}.`,
      '',
      `Thành tâm kính dâng sớ cầu siêu tại ${temple.name}, cúi xin chứng minh, tiếp dẫn hương linh:`,
      ...petition.people.map((p) => `  – ${describePerson(p, true)}`),
      `${prayer}.`,
    );
  } else {
    const [first, ...others] = petition.people;
    const writtenForOthers = !petition.people.some((p) => p.relation === 'self');
    lines.push(`Tín chủ con là: ${first ? describePerson(first, writtenForOthers) : '…'}.`);
    if (others.length > 0) {
      lines.push('Cùng những người thân:', ...others.map((p) => `  – ${describePerson(p, true)}`));
    }
    lines.push(`Ngụ tại: ${address}.`);
    if (writtenForOthers) {
      lines.push(`Sớ do ${petition.requesterName || '…'} thành tâm viết hộ.`);
    }
    lines.push(
      '',
      `Thành tâm kính dâng sớ ${type?.name.toLowerCase() ?? ''} tại ${temple.name}, ` +
        `cúi xin chứng giám lòng thành, phù hộ độ trì cho ${others.length > 0 ? 'tất cả' : 'tín chủ'} ` +
        `${prayer}.`,
    );
  }

  if (petition.wish) lines.push('', `Lời nguyện: ${petition.wish}`);
  lines.push('', 'Chúng con lễ bạc tâm thành, cúi xin chứng giám.');
  return lines.join('\n');
}

/** Short summary for lists: "Sớ cầu an · 3 người". */
export function petitionSummary(petition: Petition): string {
  const type = getPetitionType(petition.typeId);
  const count = petition.people.length;
  return `Sớ ${type?.name.toLowerCase() ?? ''}${count > 1 ? ` · ${count} người` : ''}`;
}
