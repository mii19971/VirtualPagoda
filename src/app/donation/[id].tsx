import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import DonationForm, { type DonationFormValues } from '@/components/donation/DonationForm';
import ReceiptPhotoView from '@/components/donation/ReceiptPhotoView';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { confirmAsync, notify } from '@/lib/confirm';
import { formatDateTime } from '@/lib/format';
import { deleteDonation, getDonation, updateDonation } from '@/services/donation-service';
import type { Donation } from '@/services/donation-types';
import { deleteReceiptImage } from '@/services/receipt-image';

export default function DonationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [donation, setDonation] = useState<Donation | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDonation(id)
      .then((d) => setDonation(d ?? null))
      .catch(() => setDonation(null));
  }, [id]);

  if (donation === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!donation) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Không tìm thấy' }} />
        <AppText>Không tìm thấy phiếu này.</AppText>
      </View>
    );
  }

  async function save(values: DonationFormValues) {
    if (!donation) return;
    setSaving(true);
    try {
      await updateDonation(donation.id, {
        ...values,
        imageUri: donation.imageUri,
        extractionJson: donation.extractionJson,
      });
      router.back();
    } catch {
      notify('Lỗi', 'Không lưu được thay đổi.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!donation) return;
    const ok = await confirmAsync(
      'Xóa phiếu',
      `Xóa phiếu của ${donation.fullName} khỏi sổ công đức?`,
      'Xóa',
      true,
    );
    if (!ok) return;
    await deleteDonation(donation.id);
    deleteReceiptImage(donation.imageUri);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen options={{ title: 'Phiếu công đức' }} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        {donation.imageUri ? <ReceiptPhotoView uri={donation.imageUri} /> : null}
        <AppText style={styles.meta}>
          Ghi lúc {formatDateTime(donation.createdAt)}
          {donation.updatedAt !== donation.createdAt
            ? ` · Sửa lúc ${formatDateTime(donation.updatedAt)}`
            : ''}
        </AppText>
        <DonationForm
          initial={donation}
          submitLabel="Lưu thay đổi"
          submitting={saving}
          onSubmit={(values) => void save(values)}
        />
        <View style={styles.delete}>
          <AppButton title="Xóa phiếu" variant="outline" onPress={() => void remove()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  meta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  delete: {
    marginTop: SPACING.md,
  },
});
