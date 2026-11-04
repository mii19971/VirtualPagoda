import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import DonationForm, { type DonationFormValues } from '@/components/donation/DonationForm';
import ReceiptPhotoView from '@/components/donation/ReceiptPhotoView';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useAuth } from '@/context/auth-context';
import { confirmAsync, notify } from '@/lib/confirm';
import { formatVND } from '@/lib/format';
import { createDonation, findPossibleDuplicate } from '@/services/donation-service';
import type { ReceiptExtraction } from '@/services/donation-types';
import { persistReceiptImage } from '@/services/receipt-image';
import { pickReceiptPhoto, readReceipt, ReceiptScanError, type ReceiptPhoto } from '@/services/receipt-scan';

type Step =
  | { kind: 'start' }
  | { kind: 'reading'; photo: ReceiptPhoto }
  | { kind: 'review'; photo?: ReceiptPhoto; extraction?: ReceiptExtraction; error?: string };

export default function NewDonationScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>({ kind: 'start' });
  const [saving, setSaving] = useState(false);
  // Remounts the form so each receipt starts from its own reading.
  const [formKey, setFormKey] = useState(0);

  async function capture(source: 'camera' | 'library') {
    let photo: ReceiptPhoto | null;
    try {
      photo = await pickReceiptPhoto(source);
    } catch (e) {
      notify('Không mở được ảnh', e instanceof ReceiptScanError ? e.message : 'Vui lòng thử lại.');
      return;
    }
    if (!photo) return;

    setStep({ kind: 'reading', photo });
    try {
      const extraction = await readReceipt(photo);
      setStep({ kind: 'review', photo, extraction });
    } catch (e) {
      // Reading failed, but the photo is still useful: let staff type the values in.
      const error = e instanceof ReceiptScanError ? e.message : 'Không đọc được phiếu.';
      setStep({ kind: 'review', photo, error });
    }
    setFormKey((k) => k + 1);
  }

  function enterManually() {
    setStep({ kind: 'review' });
    setFormKey((k) => k + 1);
  }

  async function save(values: DonationFormValues, action: 'primary' | 'secondary') {
    if (!user || step.kind !== 'review') return;

    const duplicate = await findPossibleDuplicate(values);
    if (duplicate) {
      const proceed = await confirmAsync(
        'Có thể bị trùng',
        `Đã có phiếu của ${duplicate.fullName}, ${formatVND(duplicate.amount)} trong cùng ngày. Vẫn lưu?`,
        'Vẫn lưu',
      );
      if (!proceed) return;
    }

    setSaving(true);
    try {
      const imageUri = step.photo ? await persistReceiptImage(step.photo.uri) : undefined;
      await createDonation(
        {
          ...values,
          imageUri,
          extractionJson: step.extraction ? JSON.stringify(step.extraction) : undefined,
        },
        user.id,
      );
    } catch {
      notify('Lỗi', 'Không lưu được phiếu, vui lòng thử lại.');
      return;
    } finally {
      setSaving(false);
    }

    if (action === 'secondary') {
      setStep({ kind: 'start' });
      void capture('camera');
    } else {
      router.back();
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen options={{ title: 'Ghi phiếu công đức' }} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        {step.kind === 'start' ? (
          <View style={styles.start}>
            <AppText style={styles.title}>Chụp phiếu công đức</AppText>
            <AppText style={styles.subtitle}>
              Đặt phiếu trên mặt phẳng, đủ sáng, chụp thẳng và rõ toàn bộ phiếu. Hệ thống sẽ tự
              đọc họ tên, địa chỉ, năm sinh và số tiền.
            </AppText>
            <AppButton title="📷  Chụp phiếu" onPress={() => void capture('camera')} />
            <AppButton
              title="Chọn ảnh có sẵn"
              variant="outline"
              onPress={() => void capture('library')}
            />
            <AppButton title="Nhập tay" variant="outline" onPress={enterManually} />
          </View>
        ) : null}

        {step.kind === 'reading' ? (
          <View style={styles.reading}>
            <ReceiptPhotoView uri={step.photo.uri} />
            <View style={styles.readingRow}>
              <ActivityIndicator color={COLORS.primary} />
              <AppText>Đang đọc phiếu…</AppText>
            </View>
          </View>
        ) : null}

        {step.kind === 'review' ? (
          <View style={styles.review}>
            {step.photo ? <ReceiptPhotoView uri={step.photo.uri} /> : null}
            {step.error ? (
              <View style={styles.errorBox}>
                <AppText style={styles.errorText}>{step.error}</AppText>
                {step.photo ? (
                  <AppButton
                    title="Chụp lại"
                    variant="outline"
                    onPress={() => void capture('camera')}
                  />
                ) : null}
              </View>
            ) : null}
            <DonationForm
              key={formKey}
              initial={step.extraction}
              uncertainFields={step.extraction?.uncertainFields}
              submitLabel="Lưu vào sổ"
              secondaryLabel={Platform.OS === 'web' ? undefined : 'Lưu & chụp phiếu tiếp'}
              submitting={saving}
              onSubmit={(values, action) => void save(values, action)}
            />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  start: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  reading: {
    gap: SPACING.md,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  review: {
    gap: SPACING.md,
  },
  errorBox: {
    gap: SPACING.sm,
    padding: SPACING.sm + 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.danger,
    backgroundColor: '#FDECEA',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
  },
});
