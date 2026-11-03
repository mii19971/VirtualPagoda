import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import AppTextInput from '@/components/common/AppTextInput';
import Chip from '@/components/common/Chip';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useAuth } from '@/context/auth-context';
import { getOffering } from '@/data/offerings';
import { PETITION_TYPES } from '@/data/petitions';
import { getTemple } from '@/data/temples';
import { formatVND } from '@/lib/format';
import { buildPetitionText } from '@/lib/petition';
import { createOrder, type Petition } from '@/services/order-service';

const MAX_WISH_LENGTH = 500;

type Errors = { devoteeName?: string; birthYear?: string; address?: string; form?: string };

function validatePetition(p: Petition): Errors {
  const year = Number(p.birthYear);
  const thisYear = new Date().getFullYear();
  return {
    devoteeName: p.devoteeName.trim().length < 2 ? 'Vui lòng nhập họ tên tín chủ.' : undefined,
    birthYear:
      p.birthYear && !(Number.isInteger(year) && year >= 1900 && year <= thisYear)
        ? 'Năm sinh không hợp lệ.'
        : undefined,
    address: p.address.trim().length < 3 ? 'Vui lòng nhập địa chỉ.' : undefined,
  };
}

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{
    templeId: string;
    offeringId?: string;
    petitionOnly?: string;
  }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const temple = getTemple(params.templeId);
  const offering = params.petitionOnly ? undefined : getOffering(params.offeringId);

  // Without an offering, the petition is the whole submission and cannot be turned off.
  const [writePetition, setWritePetition] = useState(!offering);
  const [petition, setPetition] = useState<Petition>({
    typeId: PETITION_TYPES[0].id,
    devoteeName: user?.name ?? '',
    birthYear: '',
    address: '',
    wish: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!temple || !user) {
    return (
      <View style={styles.missing}>
        <AppText>Không tìm thấy thông tin lễ.</AppText>
      </View>
    );
  }

  const update = (patch: Partial<Petition>) => setPetition((p) => ({ ...p, ...patch }));
  const total = offering?.price ?? 0;
  const submitLabel = offering ? `Dâng lễ · ${formatVND(total)}` : 'Gửi sớ';

  const handleSubmit = async () => {
    if (writePetition) {
      const nextErrors = validatePetition(petition);
      setErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        userId: user.id,
        templeId: temple.id,
        offeringId: offering?.id,
        offeringName: offering?.name,
        total,
        petition: writePetition
          ? {
              ...petition,
              devoteeName: petition.devoteeName.trim(),
              address: petition.address.trim(),
              wish: petition.wish.trim(),
              birthYear: petition.birthYear?.trim() || undefined,
            }
          : undefined,
      });
      router.replace({ pathname: '/order/[id]', params: { id: order.id, submitted: '1' } });
    } catch {
      setErrors({ form: 'Gửi lễ thất bại, vui lòng thử lại.' });
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen options={{ title: offering ? 'Xác nhận lễ' : 'Viết sớ' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.summary}>
          <Image source={temple.image} style={styles.thumb} contentFit="cover" />
          <View style={styles.summaryText}>
            <AppText style={styles.templeName}>{temple.name}</AppText>
            <AppText style={styles.muted}>{temple.province}</AppText>
            {offering ? (
              <View style={styles.offeringRow}>
                <AppText style={styles.offeringName}>{offering.name}</AppText>
                <AppText style={styles.price}>{formatVND(offering.price)}</AppText>
              </View>
            ) : (
              <AppText style={styles.muted}>Chỉ gửi sớ, không sắp lễ</AppText>
            )}
          </View>
        </View>

        {offering ? (
          <View style={styles.toggleRow}>
            <View style={styles.flex}>
              <AppText style={styles.toggleTitle}>Viết sớ kèm lễ</AppText>
              <AppText style={styles.muted}>Sớ sẽ được đọc và hóa cùng lễ của bạn.</AppText>
            </View>
            <Switch
              value={writePetition}
              onValueChange={setWritePetition}
              trackColor={{ true: COLORS.primary, false: COLORS.border }}
              accessibilityLabel="Viết sớ kèm lễ"
            />
          </View>
        ) : null}

        {writePetition ? (
          <View style={styles.petition}>
            <AppText style={styles.section}>Loại sớ</AppText>
            <View style={styles.chips}>
              {PETITION_TYPES.map((t) => (
                <Chip
                  key={t.id}
                  label={t.name}
                  selected={petition.typeId === t.id}
                  onPress={() => update({ typeId: t.id })}
                />
              ))}
            </View>

            <AppTextInput
              label="Họ tên tín chủ"
              value={petition.devoteeName}
              onChangeText={(devoteeName) => update({ devoteeName })}
              error={errors.devoteeName}
              autoComplete="name"
              returnKeyType="next"
            />
            <AppTextInput
              label="Năm sinh (không bắt buộc)"
              placeholder="VD: 1990"
              value={petition.birthYear}
              onChangeText={(birthYear) => update({ birthYear: birthYear.replace(/\D/g, '') })}
              error={errors.birthYear}
              keyboardType="number-pad"
              maxLength={4}
              returnKeyType="next"
            />
            <AppTextInput
              label="Địa chỉ"
              placeholder="VD: Phường Hoàn Kiếm, Hà Nội"
              value={petition.address}
              onChangeText={(address) => update({ address })}
              error={errors.address}
              autoComplete="street-address"
              returnKeyType="next"
            />
            <AppTextInput
              label={`Lời nguyện (${petition.wish.length}/${MAX_WISH_LENGTH})`}
              placeholder="Điều bạn muốn cầu nguyện…"
              value={petition.wish}
              onChangeText={(wish) => update({ wish })}
              maxLength={MAX_WISH_LENGTH}
              multiline
              textAlignVertical="top"
              style={styles.wish}
            />

            <AppText style={styles.section}>Xem trước sớ</AppText>
            <View style={styles.preview}>
              <AppText style={styles.previewText}>
                {buildPetitionText(
                  { ...petition, devoteeName: petition.devoteeName || '…', address: petition.address || '…' },
                  temple,
                  new Date().toISOString(),
                )}
              </AppText>
            </View>
          </View>
        ) : null}

        {errors.form ? <AppText style={styles.formError}>{errors.form}</AppText> : null}
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + SPACING.sm }]}>
        {offering ? (
          <View style={styles.totalRow}>
            <AppText style={styles.muted}>Tổng cộng</AppText>
            <AppText style={styles.total}>{formatVND(total)}</AppText>
          </View>
        ) : null}
        <AppButton title={submitLabel} onPress={handleSubmit} loading={submitting} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  summary: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  templeName: {
    fontWeight: '700',
    fontSize: 17,
  },
  muted: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  offeringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    gap: SPACING.sm,
  },
  offeringName: {
    flex: 1,
    fontSize: 15,
  },
  price: {
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  toggleTitle: {
    fontWeight: '700',
  },
  petition: {
    marginTop: SPACING.md,
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  wish: {
    minHeight: 100,
  },
  preview: {
    backgroundColor: '#FDF6E3',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.md,
  },
  previewText: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  formError: {
    color: COLORS.danger,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  bar: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
