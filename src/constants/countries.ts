export type Country = {
  /** ISO 3166-1 alpha-2 code. */
  code: string;
  name: string;
  /** International dialing code, without the leading "+". */
  dialCode: string;
};

export const COUNTRIES: Country[] = [
  { code: 'VN', name: 'Việt Nam', dialCode: '84' },
  { code: 'US', name: 'Hoa Kỳ', dialCode: '1' },
  { code: 'CA', name: 'Canada', dialCode: '1' },
  { code: 'AU', name: 'Úc', dialCode: '61' },
  { code: 'NZ', name: 'New Zealand', dialCode: '64' },
  { code: 'GB', name: 'Vương quốc Anh', dialCode: '44' },
  { code: 'FR', name: 'Pháp', dialCode: '33' },
  { code: 'DE', name: 'Đức', dialCode: '49' },
  { code: 'IT', name: 'Ý', dialCode: '39' },
  { code: 'ES', name: 'Tây Ban Nha', dialCode: '34' },
  { code: 'PT', name: 'Bồ Đào Nha', dialCode: '351' },
  { code: 'NL', name: 'Hà Lan', dialCode: '31' },
  { code: 'BE', name: 'Bỉ', dialCode: '32' },
  { code: 'CH', name: 'Thụy Sĩ', dialCode: '41' },
  { code: 'AT', name: 'Áo', dialCode: '43' },
  { code: 'SE', name: 'Thụy Điển', dialCode: '46' },
  { code: 'NO', name: 'Na Uy', dialCode: '47' },
  { code: 'DK', name: 'Đan Mạch', dialCode: '45' },
  { code: 'FI', name: 'Phần Lan', dialCode: '358' },
  { code: 'IE', name: 'Ireland', dialCode: '353' },
  { code: 'PL', name: 'Ba Lan', dialCode: '48' },
  { code: 'CZ', name: 'Séc', dialCode: '420' },
  { code: 'HU', name: 'Hungary', dialCode: '36' },
  { code: 'RO', name: 'Romania', dialCode: '40' },
  { code: 'BG', name: 'Bulgaria', dialCode: '359' },
  { code: 'GR', name: 'Hy Lạp', dialCode: '30' },
  { code: 'UA', name: 'Ukraina', dialCode: '380' },
  { code: 'RU', name: 'Nga', dialCode: '7' },
  { code: 'TR', name: 'Thổ Nhĩ Kỳ', dialCode: '90' },
  { code: 'CN', name: 'Trung Quốc', dialCode: '86' },
  { code: 'HK', name: 'Hồng Kông', dialCode: '852' },
  { code: 'MO', name: 'Ma Cao', dialCode: '853' },
  { code: 'TW', name: 'Đài Loan', dialCode: '886' },
  { code: 'JP', name: 'Nhật Bản', dialCode: '81' },
  { code: 'KR', name: 'Hàn Quốc', dialCode: '82' },
  { code: 'MN', name: 'Mông Cổ', dialCode: '976' },
  { code: 'LA', name: 'Lào', dialCode: '856' },
  { code: 'KH', name: 'Campuchia', dialCode: '855' },
  { code: 'TH', name: 'Thái Lan', dialCode: '66' },
  { code: 'MM', name: 'Myanmar', dialCode: '95' },
  { code: 'MY', name: 'Malaysia', dialCode: '60' },
  { code: 'SG', name: 'Singapore', dialCode: '65' },
  { code: 'ID', name: 'Indonesia', dialCode: '62' },
  { code: 'PH', name: 'Philippines', dialCode: '63' },
  { code: 'BN', name: 'Brunei', dialCode: '673' },
  { code: 'TL', name: 'Đông Timor', dialCode: '670' },
  { code: 'IN', name: 'Ấn Độ', dialCode: '91' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '94' },
  { code: 'NP', name: 'Nepal', dialCode: '977' },
  { code: 'BT', name: 'Bhutan', dialCode: '975' },
  { code: 'BD', name: 'Bangladesh', dialCode: '880' },
  { code: 'PK', name: 'Pakistan', dialCode: '92' },
  { code: 'AE', name: 'Các TVQ Ả Rập Thống nhất', dialCode: '971' },
  { code: 'SA', name: 'Ả Rập Xê Út', dialCode: '966' },
  { code: 'QA', name: 'Qatar', dialCode: '974' },
  { code: 'KW', name: 'Kuwait', dialCode: '965' },
  { code: 'IL', name: 'Israel', dialCode: '972' },
  { code: 'EG', name: 'Ai Cập', dialCode: '20' },
  { code: 'ZA', name: 'Nam Phi', dialCode: '27' },
  { code: 'NG', name: 'Nigeria', dialCode: '234' },
  { code: 'KE', name: 'Kenya', dialCode: '254' },
  { code: 'MX', name: 'Mexico', dialCode: '52' },
  { code: 'BR', name: 'Brazil', dialCode: '55' },
  { code: 'AR', name: 'Argentina', dialCode: '54' },
  { code: 'CL', name: 'Chile', dialCode: '56' },
  { code: 'CO', name: 'Colombia', dialCode: '57' },
  { code: 'PE', name: 'Peru', dialCode: '51' },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0];

/** Builds the flag emoji from the ISO code (regional indicator symbols). */
export function countryFlag(code: string): string {
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
