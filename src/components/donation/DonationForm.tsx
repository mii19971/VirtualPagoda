import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import AppTextInput from '@/components/common/AppTextInput';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { formatISODate, formatVND, parseVNDate, todayISODate } from '@/lib/format';
import type { DonationInput, ReceiptField } from '@/services/donation-types';

export type DonationFormValues = Pick<
  DonationInput,
  | 'receiptNumber'
  | 'fullName'
  | 'address'
  | 'birthYear'
  | 'amount'
  | 'amountInWords'
  | 'donationDate'
  | 'note'
>;

type Props = {
  initial?: Partial<DonationFormValues>;
  /** Fields the AI was unsure about; highlighted until the staff member edits them. */
  uncertainFields?: ReceiptField[];
  submitLabel: string;
  /** Optional second action, e.g. "Lưu & chụp tiếp". */
  secondaryLabel?: string;
  submitting?: boolean;
  onSubmit: (values: DonationFormValues, action: 'primary' | 'secondary') => void;
};

type Errors = Partial<Record<'fullName' | 'birthYear' | 'amount' | 'donationDate', string>>;

const digitsOnly = (text: string) => text.replace(/\D/g, '');
const groupThousands = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function DonationForm({
  initial,
  uncertainFields = [],
  submitLabel,
  secondaryLabel,
  submitting,
  onSubmit,
}: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [birthYear, setBirthYear] = useState(initial?.birthYear ? String(initial.birthYear) : '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
  const [amountInWords, setAmountInWords] = useState(initial?.amountInWords ?? '');
  const [date, setDate] = useState(formatISODate(initial?.donationDate || todayISODate()));
  const [receiptNumber, setReceiptNumber] = useState(initial?.receiptNumber ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [errors, setErrors] = useState<Errors>({});
  // A highlighted field stops being highlighted once the staff member has touched it.
  const [unsure, setUnsure] = useState(() => new Set(uncertainFields));

  const touch = (field: ReceiptField) =>
    setUnsure((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });

  const flag = (field: ReceiptField) => (unsure.has(field) ? styles.unsure : undefined);
  const label = (text: string, field: ReceiptField) =>
    unsure.has(field) ? `${text}  ⚠ cần kiểm tra` : text;

  function submit(action: 'primary' | 'secondary') {
    const next: Errors = {};
    const year = birthYear ? Number(birthYear) : undefined;
    const money = Number(amount);
    const isoDate = parseVNDate(date);

    if (fullName.trim().length < 2) next.fullName = 'Vui lòng nhập họ tên.';
    if (year !== undefined && (year < 1900 || year > new Date().getFullYear())) {
      next.birthYear = 'Năm sinh không hợp lệ.';
    }
    if (!money) next.amount = 'Vui lòng nhập số tiền công đức.';
    if (!isoDate) next.donationDate = 'Ngày không hợp lệ (dd/mm/yyyy).';
    setErrors(next);
    if (Object.keys(next).length > 0 || !isoDate) return;

    onSubmit(
      {
        fullName: fullName.trim(),
        birthYear: year,
        address: address.trim(),
        amount: money,
        amountInWords: amountInWords.trim(),
        donationDate: isoDate,
        receiptNumber: receiptNumber.trim(),
        note: note.trim(),
      },
      action,
    );
  }

  return (
    <View>
      {unsure.size > 0 ? (
        <View style={styles.banner}>
          <AppText style={styles.bannerText}>
            Các ô tô vàng máy đọc chưa chắc chắn. Hãy đối chiếu với ảnh phiếu trước khi lưu.
          </AppText>
        </View>
      ) : null}

      <AppTextInput
        label={label('Họ tên *', 'fullName')}
        value={fullName}
        onChangeText={(t) => {
          setFullName(t);
          touch('fullName');
        }}
        autoCapitalize="words"
        error={errors.fullName}
        style={flag('fullName')}
      />
      <AppTextInput
        label={label('Năm sinh', 'birthYear')}
        value={birthYear}
        onChangeText={(t) => {
          setBirthYear(digitsOnly(t).slice(0, 4));
          touch('birthYear');
        }}
        keyboardType="number-pad"
        placeholder="VD: 1975"
        error={errors.birthYear}
        style={flag('birthYear')}
      />
      <AppTextInput
        label={label('Địa chỉ', 'address')}
        value={address}
        onChangeText={(t) => {
          setAddress(t);
          touch('address');
        }}
        multiline
        style={flag('address')}
      />
      <AppTextInput
        label={label('Số tiền (₫) *', 'amount')}
        value={groupThousands(amount)}
        onChangeText={(t) => {
          setAmount(digitsOnly(t).replace(/^0+/, ''));
          touch('amount');
        }}
        keyboardType="number-pad"
        placeholder="VD: 500.000"
        error={errors.amount}
        style={[styles.amount, flag('amount')]}
      />
      {amount ? <AppText style={styles.hint}>{formatVND(Number(amount))}</AppText> : null}
      <AppTextInput
        label={label('Số tiền bằng chữ', 'amountInWords')}
        value={amountInWords}
        onChangeText={(t) => {
          setAmountInWords(t);
          touch('amountInWords');
        }}
        style={flag('amountInWords')}
      />
      <AppTextInput
        label={label('Ngày công đức *', 'donationDate')}
        value={date}
        onChangeText={(t) => {
          setDate(t);
          touch('donationDate');
        }}
        placeholder="dd/mm/yyyy"
        keyboardType="numbers-and-punctuation"
        error={errors.donationDate}
        style={flag('donationDate')}
      />
      <AppTextInput
        label={label('Số phiếu', 'receiptNumber')}
        value={receiptNumber}
        onChangeText={(t) => {
          setReceiptNumber(t);
          touch('receiptNumber');
        }}
        style={flag('receiptNumber')}
      />
      <AppTextInput
        label={label('Ghi chú', 'note')}
        value={note}
        onChangeText={(t) => {
          setNote(t);
          touch('note');
        }}
        multiline
        style={flag('note')}
      />

      <View style={styles.actions}>
        <AppButton title={submitLabel} onPress={() => submit('primary')} loading={submitting} />
        {secondaryLabel ? (
          <AppButton
            title={secondaryLabel}
            variant="outline"
            onPress={() => submit('secondary')}
            disabled={submitting}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF4CC',
    borderColor: '#E8C547',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.sm + 4,
    marginBottom: SPACING.md,
  },
  bannerText: {
    fontSize: 14,
    color: '#6B5200',
  },
  unsure: {
    backgroundColor: '#FFF8DC',
    borderColor: '#E8C547',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  actions: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
});
