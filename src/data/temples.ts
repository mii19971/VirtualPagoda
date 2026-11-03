/** chua = chùa (Phật giáo), den = đền, phu = phủ (thờ Mẫu), mieu = miếu. */
export type TempleKind = 'chua' | 'den' | 'phu' | 'mieu';
export type Region = 'bac' | 'trung' | 'nam';

export type Temple = {
  id: string;
  name: string;
  kind: TempleKind;
  region: Region;
  province: string;
  description: string;
  /** Bundled asset from `require()`. */
  image: number;
  /** Photo attribution (Wikimedia Commons). Required by CC BY / CC BY-SA licenses. */
  credit: { author: string; license: string; url: string };
};

export const KIND_LABELS: Record<TempleKind, string> = {
  chua: 'Chùa',
  den: 'Đền',
  phu: 'Phủ',
  mieu: 'Miếu',
};

export const REGION_LABELS: Record<Region, string> = {
  bac: 'Miền Bắc',
  trung: 'Miền Trung',
  nam: 'Miền Nam',
};

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

export const TEMPLES: Temple[] = [
  {
    id: 'mot-cot',
    name: 'Chùa Một Cột',
    kind: 'chua',
    region: 'bac',
    province: 'Hà Nội',
    description:
      'Còn gọi là Liên Hoa Đài, dựng năm 1049 dưới triều vua Lý Thái Tông. Ngôi chùa có kiến trúc độc đáo như bông sen vươn lên từ mặt hồ, là biểu tượng của Thăng Long – Hà Nội.',
    image: require('@/assets/images/temples/mot-cot.jpg'),
    credit: { author: 'Staffan Scherz', license: 'CC BY 2.0', url: commons('One_Pillar_Pagoda_Hanoi.jpg') },
  },
  {
    id: 'tran-quoc',
    name: 'Chùa Trấn Quốc',
    kind: 'chua',
    region: 'bac',
    province: 'Hà Nội',
    description:
      'Nằm trên bán đảo phía đông Hồ Tây, có lịch sử gần 1.500 năm, được xem là ngôi chùa cổ nhất Thăng Long. Bảo tháp lục độ đài sen 11 tầng là điểm nhấn của chùa.',
    image: require('@/assets/images/temples/tran-quoc.jpg'),
    credit: { author: 'Thang Nguyen', license: 'CC BY-SA 2.0', url: commons('Chùa_Trấn_Quốc,_Hà_Nội.jpg') },
  },
  {
    id: 'ngoc-son',
    name: 'Đền Ngọc Sơn',
    kind: 'den',
    region: 'bac',
    province: 'Hà Nội',
    description:
      'Ngôi đền trên đảo Ngọc giữa hồ Hoàn Kiếm, nối với bờ bằng cầu Thê Húc. Đền thờ Văn Xương Đế Quân và Đức Thánh Trần Hưng Đạo, nơi nhiều sĩ tử đến cầu học hành, thi cử.',
    image: require('@/assets/images/temples/ngoc-son.jpg'),
    credit: { author: 'Bùi Thụy Đào Nguyên', license: 'CC BY-SA 3.0', url: commons('Cổng_đền_Ngọc_Sơn.jpg') },
  },
  {
    id: 'quan-thanh',
    name: 'Đền Quán Thánh',
    kind: 'den',
    region: 'bac',
    province: 'Hà Nội',
    description:
      'Tên chữ là Trấn Vũ Quán, có từ thời Lý Thái Tổ, thờ Huyền Thiên Trấn Vũ. Đây là một trong "Thăng Long tứ trấn", trấn giữ phía bắc kinh thành xưa.',
    image: require('@/assets/images/temples/quan-thanh.jpg'),
    credit: { author: 'Stefan Fussan', license: 'CC BY-SA 3.0', url: commons('Hanoi_-_Quan-Thanh-Tempel_0001.JPG') },
  },
  {
    id: 'phu-tay-ho',
    name: 'Phủ Tây Hồ',
    kind: 'phu',
    region: 'bac',
    province: 'Hà Nội',
    description:
      'Phủ thờ Thánh Mẫu Liễu Hạnh bên bờ Hồ Tây, một trong những nơi thờ Mẫu linh thiêng bậc nhất Hà Nội, đông khách thập phương vào dịp đầu năm và rằm, mùng một.',
    image: require('@/assets/images/temples/phu-tay-ho.jpg'),
    credit: { author: 'Bùi Thụy Đào Nguyên', license: 'CC BY-SA 3.0', url: commons('Phủ_Tây_Hồ.jpg') },
  },
  {
    id: 'chua-huong',
    name: 'Chùa Hương',
    kind: 'chua',
    region: 'bac',
    province: 'Hà Nội',
    description:
      'Quần thể văn hóa – tôn giáo Hương Sơn gồm nhiều chùa, đền, động, nổi tiếng nhất là động Hương Tích. Lễ hội chùa Hương kéo dài từ tháng Giêng đến tháng Ba âm lịch.',
    image: require('@/assets/images/temples/chua-huong.jpg'),
    credit: { author: 'Everjean', license: 'CC BY 2.0', url: commons('Chùa_Hương.jpg') },
  },
  {
    id: 'chua-thay',
    name: 'Chùa Thầy',
    kind: 'chua',
    region: 'bac',
    province: 'Hà Nội',
    description:
      'Ngôi chùa cổ dưới chân núi Sài Sơn, gắn với Thiền sư Từ Đạo Hạnh thời Lý. Trước chùa là hồ Long Trì với thủy đình, nơi biểu diễn múa rối nước truyền thống.',
    image: require('@/assets/images/temples/chua-thay.jpg'),
    credit: { author: 'BemPhoto', license: 'CC BY 2.0', url: commons('Chùa_Thầy_(9414542634).jpg') },
  },
  {
    id: 'den-soc',
    name: 'Đền Sóc (Đền Gióng)',
    kind: 'den',
    region: 'bac',
    province: 'Hà Nội (Sóc Sơn)',
    description:
      'Quần thể đền thờ Thánh Gióng – Phù Đổng Thiên Vương dưới chân núi Sóc, nơi tương truyền Thánh Gióng bay về trời sau khi đánh tan giặc Ân. Hội Gióng đền Sóc diễn ra từ mùng 6 đến mùng 8 tháng Giêng, được UNESCO ghi danh là di sản văn hóa phi vật thể của nhân loại.',
    image: require('@/assets/images/temples/den-soc.jpg'),
    credit: { author: 'NKSTTSSHNVN', license: 'CC BY-SA 4.0', url: commons('Đền_Sóc_-_NKS.jpg') },
  },
  {
    id: 'bai-dinh',
    name: 'Chùa Bái Đính',
    kind: 'chua',
    region: 'bac',
    province: 'Ninh Bình',
    description:
      'Quần thể chùa lớn trên núi Bái Đính, gồm khu chùa cổ và khu chùa mới với nhiều kỷ lục như hành lang La Hán, tượng Phật bằng đồng và chuông đồng lớn.',
    image: require('@/assets/images/temples/bai-dinh.jpg'),
    credit: { author: 'Kien1980v', license: 'Public domain', url: commons('Chua_Bai_Dinh_X8.JPG') },
  },
  {
    id: 'den-hung',
    name: 'Đền Hùng',
    kind: 'den',
    region: 'bac',
    province: 'Phú Thọ',
    description:
      'Khu di tích trên núi Nghĩa Lĩnh thờ các Vua Hùng – Quốc Tổ của dân tộc. Giỗ Tổ Hùng Vương được tổ chức vào ngày 10 tháng Ba âm lịch hằng năm.',
    image: require('@/assets/images/temples/den-hung.jpg'),
    credit: { author: 'Viethavvh', license: 'Public domain', url: commons('Mausoleum_of_Hung_King.JPG') },
  },
  {
    id: 'den-tran',
    name: 'Đền Trần',
    kind: 'den',
    region: 'bac',
    province: 'Ninh Bình (Nam Định cũ)',
    description:
      'Quần thể đền thờ các vị vua Trần và các quan lại có công nhà Trần. Lễ khai ấn đền Trần đêm 14 tháng Giêng thu hút đông đảo du khách cầu may đầu năm.',
    image: require('@/assets/images/temples/den-tran.jpg'),
    credit: { author: 'Hoangvantoanajc', license: 'CC0', url: commons('Tam_quan_Den_Tran.jpg') },
  },
  {
    id: 'chua-dau',
    name: 'Chùa Dâu',
    kind: 'chua',
    region: 'bac',
    province: 'Bắc Ninh',
    description:
      'Được xem là trung tâm Phật giáo cổ nhất Việt Nam, thờ Phật Mẫu Man Nương và Tứ Pháp (Pháp Vân, Pháp Vũ, Pháp Lôi, Pháp Điện), gắn với tín ngưỡng nông nghiệp lúa nước.',
    image: require('@/assets/images/temples/chua-dau.jpg'),
    credit: { author: 'Chitto', license: 'CC BY-SA 3.0', url: commons('Dau_pagoda.jpg') },
  },
  {
    id: 'but-thap',
    name: 'Chùa Bút Tháp',
    kind: 'chua',
    region: 'bac',
    province: 'Bắc Ninh',
    description:
      'Ngôi chùa cổ bên bờ sông Đuống, nổi tiếng với tượng Quán Thế Âm Bồ Tát nghìn mắt nghìn tay và tháp Báo Nghiêm bằng đá chạm khắc tinh xảo.',
    image: require('@/assets/images/temples/but-thap.jpg'),
    credit: { author: 'Tango7174', license: 'CC BY-SA 4.0', url: commons('VN_But_Thap3_tango7174.jpg') },
  },
  {
    id: 'thien-mu',
    name: 'Chùa Thiên Mụ',
    kind: 'chua',
    region: 'trung',
    province: 'Huế',
    description:
      'Ngôi chùa cổ trên đồi Hà Khê, tả ngạn sông Hương, được chúa Nguyễn Hoàng cho xây năm 1601. Tháp Phước Duyên bảy tầng là biểu tượng của cố đô Huế.',
    image: require('@/assets/images/temples/thien-mu.jpg'),
    credit: { author: 'Lưu Ly', license: 'Public domain', url: commons('ThienMuPagoda.jpg') },
  },
  {
    id: 'tu-dam',
    name: 'Chùa Từ Đàm',
    kind: 'chua',
    region: 'trung',
    province: 'Huế',
    description:
      'Một trong những ngôi chùa lớn và quan trọng của Phật giáo xứ Huế, nơi thành lập Tổng hội Phật giáo Việt Nam năm 1951.',
    image: require('@/assets/images/temples/tu-dam.jpg'),
    credit: {
      author: 'Phương Huy',
      license: 'CC BY-SA 4.0',
      url: commons('Chùa_Từ_Đàm_ở_Huế_ngày_20_tháng_8_năm_2017_(2).jpg'),
    },
  },
  {
    id: 'linh-ung',
    name: 'Chùa Linh Ứng Bãi Bụt',
    kind: 'chua',
    region: 'trung',
    province: 'Đà Nẵng',
    description:
      'Tọa lạc trên bán đảo Sơn Trà, hướng ra biển Đông, nổi bật với tượng Quán Thế Âm Bồ Tát cao 67 m – điểm hành hương nổi tiếng của Đà Nẵng.',
    image: require('@/assets/images/temples/linh-ung.jpg'),
    credit: {
      author: 'CEphoto, Uwe Aranas',
      license: 'CC BY-SA 3.0',
      url: commons('Son-Tra-Peninsula_Da-Nang_Vietnam_Linh-Ung-Pagoda-01.jpg'),
    },
  },
  {
    id: 'vinh-nghiem',
    name: 'Chùa Vĩnh Nghiêm',
    kind: 'chua',
    region: 'nam',
    province: 'TP. Hồ Chí Minh',
    description:
      'Ngôi chùa lớn của Sài Gòn, xây dựng từ năm 1964, mang phong cách kiến trúc chùa Bắc Bộ với bảo tháp nhiều tầng và đại hồng chung.',
    image: require('@/assets/images/temples/vinh-nghiem.jpg'),
    credit: { author: 'Bùi Thụy Đào Nguyên', license: 'CC BY-SA 3.0', url: commons('Cổng_chùa_Vĩnh_Nghiêm.jpg') },
  },
  {
    id: 'giac-lam',
    name: 'Chùa Giác Lâm',
    kind: 'chua',
    region: 'nam',
    province: 'TP. Hồ Chí Minh',
    description:
      'Được xây dựng năm 1744, là một trong những ngôi chùa cổ nhất đất Gia Định – Sài Gòn, còn lưu giữ nhiều tượng gỗ và hoành phi, câu đối quý.',
    image: require('@/assets/images/temples/giac-lam.jpg'),
    credit: { author: 'Phan Ba', license: 'Public domain', url: commons('ChuaGiacLam01.jpg') },
  },
  {
    id: 'ngoc-hoang',
    name: 'Chùa Ngọc Hoàng',
    kind: 'chua',
    region: 'nam',
    province: 'TP. Hồ Chí Minh',
    description:
      'Còn gọi là Phước Hải Tự, xây dựng đầu thế kỷ 20, thờ Ngọc Hoàng Thượng Đế cùng nhiều vị thần, Phật; nổi tiếng là nơi cầu tự, cầu duyên linh thiêng.',
    image: require('@/assets/images/temples/ngoc-hoang.jpg'),
    credit: { author: 'Bùi Thụy Đào Nguyên', license: 'CC BY-SA 3.0', url: commons('Phước_Hải_Tự.jpg') },
  },
  {
    id: 'ba-chua-xu',
    name: 'Miếu Bà Chúa Xứ Núi Sam',
    kind: 'mieu',
    region: 'nam',
    province: 'An Giang',
    description:
      'Ngôi miếu dưới chân núi Sam, Châu Đốc, thờ Bà Chúa Xứ. Lễ vía Bà diễn ra từ ngày 23 đến 27 tháng Tư âm lịch, là lễ hội tín ngưỡng lớn nhất Nam Bộ.',
    image: require('@/assets/images/temples/ba-chua-xu.jpg'),
    credit: { author: 'Bùi Thụy Đào Nguyên', license: 'Public domain', url: commons('Mieuba2.jpg') },
  },
];

export function getTemple(id: string | undefined): Temple | undefined {
  return TEMPLES.find((t) => t.id === id);
}
