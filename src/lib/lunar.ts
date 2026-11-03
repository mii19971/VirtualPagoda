/**
 * Vietnamese lunar calendar (âm lịch) conversion.
 * Astronomical algorithm by Hồ Ngọc Đức ("Âm lịch Việt Nam"), computed for UTC+7
 * because the Vietnamese calendar is defined by new moons as observed in Vietnam,
 * which is why some months differ from the Chinese calendar (UTC+8).
 */

const VN_TIMEZONE = 7;
const PI = Math.PI;
const INT = Math.floor;

export type LunarDate = {
  day: number;
  month: number;
  year: number;
  /** True for a leap month (tháng nhuận). */
  leap: boolean;
  /** Julian day number of the solar date, used for the day's can chi. */
  jd: number;
};

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const MONTH_NAMES = [
  'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Một', 'Chạp',
];

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

/** Day number of the k-th new moon after 1900-01-01 13:52 UT. */
function getNewMoonDay(k: number, tz: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltat =
    T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return INT(jd1 + C1 - deltat + 0.5 + tz / 24);
}

/** Sun longitude at local midnight of the given day, as one of 12 sectors (0..11). */
function getSunLongitude(jdn: number, tz: number): number {
  const T = (jdn - 2451545.5 - tz / 24) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L = L - PI * 2 * INT(L / (PI * 2));
  return INT((L / PI) * 6);
}

/** Start of lunar month 11 (the month containing the winter solstice) of the given year. */
function getLunarMonth11(yy: number, tz: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, tz);
  if (getSunLongitude(nm, tz) >= 9) {
    nm = getNewMoonDay(k - 1, tz);
  }
  return nm;
}

/** Index (after month 11) of the leap month: the first month without a major solar term. */
function getLeapMonthOffset(a11: number, tz: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last: number;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
  } while (arc !== last && i < 14);
  return i - 1;
}

export function solarToLunar(dd: number, mm: number, yy: number, tz = VN_TIMEZONE): LunarDate {
  const jd = jdFromDate(dd, mm, yy);
  const k = INT((jd - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, tz);
  if (monthStart > jd) {
    monthStart = getNewMoonDay(k, tz);
  }
  let a11 = getLunarMonth11(yy, tz);
  let b11 = a11;
  let year: number;
  if (a11 >= monthStart) {
    year = yy;
    a11 = getLunarMonth11(yy - 1, tz);
  } else {
    year = yy + 1;
    b11 = getLunarMonth11(yy + 1, tz);
  }
  const day = jd - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let leap = false;
  let month = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, tz);
    if (diff >= leapMonthDiff) {
      month = diff + 10;
      leap = diff === leapMonthDiff;
    }
  }
  if (month > 12) month -= 12;
  if (month >= 11 && diff < 4) year -= 1;
  return { day, month, year, leap, jd };
}

/** Lunar date of an instant, using the calendar day in Vietnam (UTC+7) regardless of device timezone. */
export function lunarDateOf(date: Date): LunarDate {
  const vn = new Date(date.getTime() + VN_TIMEZONE * 3600 * 1000);
  return solarToLunar(vn.getUTCDate(), vn.getUTCMonth() + 1, vn.getUTCFullYear());
}

/** 1990 → "Canh Ngọ". */
export function canChiOfYear(year: number): string {
  return `${CAN[(year + 6) % 10]} ${CHI[(year + 8) % 12]}`;
}

export function canChiOfMonth(lunar: LunarDate): string {
  return `${CAN[(lunar.year * 12 + lunar.month + 3) % 10]} ${CHI[(lunar.month + 1) % 12]}`;
}

export function canChiOfDay(lunar: LunarDate): string {
  return `${CAN[(lunar.jd + 9) % 10]} ${CHI[(lunar.jd + 1) % 12]}`;
}

/** 1 → "mùng 1", 15 → "rằm" when `festive`, otherwise "15". */
export function lunarDayName(day: number, festive = false): string {
  if (festive && day === 15) return 'rằm';
  return day <= 10 ? `mùng ${day}` : `${day}`;
}

/** 1 → "Giêng", 12 → "Chạp", with "nhuận" for a leap month. */
export function lunarMonthName(lunar: Pick<LunarDate, 'month' | 'leap'>): string {
  return `${MONTH_NAMES[lunar.month - 1]}${lunar.leap ? ' nhuận' : ''}`;
}

/** "ngày mùng 3 tháng Giêng năm Bính Ngọ" */
export function formatLunarDate(lunar: LunarDate): string {
  return `ngày ${lunarDayName(lunar.day)} tháng ${lunarMonthName(lunar)} năm ${canChiOfYear(lunar.year)}`;
}

/** "3/1 Bính Ngọ" (compact, for lists). */
export function formatLunarShort(lunar: LunarDate): string {
  return `${lunar.day}/${lunar.month}${lunar.leap ? 'N' : ''} ${canChiOfYear(lunar.year)}`;
}
