import * as Crypto from 'expo-crypto';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import AppTextInput from '@/components/common/AppTextInput';
import Chip from '@/components/common/Chip';
import PersonEditor, { type PersonErrors } from '@/components/petition/PersonEditor';
import OfferingOption from '@/components/temple/OfferingOption';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useAuth } from '@/context/auth-context';
import { getOffering, offeringsFor } from '@/data/offerings';
import { MEMORIAL_TYPE_ID, PETITION_TYPES, type RelationId } from '@/data/petitions';
import { getTemple } from '@/data/temples';
import { formatVND } from '@/lib/format';
import { buildPetitionText } from '@/lib/petition';
import { createOrder, type Petition, type PetitionPerson } from '@/services/order-service';

const MAX_WISH_LENGTH = 500;
const MAX_PEOPLE = 10;

type Mode = 'both' | 'offering' | 'petition';

const MODES: { value: Mode; label: string }[] = [
  { value: 'both', label: 'Lễ + Sớ' },
  { value: 'offering', label: 'Chỉ sắp lễ' },
  { value: 'petition', label: 'Chỉ viết sớ' },
];

type PetitionDraft = Omit<Petition, 'requesterName'>;

type Errors = {
  offering?: string;
  people?: Record<string, PersonErrors>;
  address?: string;
  form?: string;
};

function newPerson(relation: RelationId, name = ''): PetitionPerson {
  return { id: Crypto.randomUUID(), name, birthYear: '', relation };
}

function validateYear(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const year = Number(value);
  return Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear()
    ? undefined
    : 'Năm sinh không hợp lệ.';
}

function validate(mode: Mode, offeringId: string | null, draft: PetitionDraft): Errors {
  const errors: Errors = {};
  if (mode !== 'petition' && !offeringId) errors.offering = 'Vui lòng chọn một lễ.';
  if (mode !== 'offering') {
    const people: Record<string, PersonErrors> = {};
    for (const p of draft.people) {
      const e: PersonErrors = {
        name: p.name.trim().length < 2 ? 'Vui lòng nhập họ tên.' : undefined,
        birthYear: validateYear(p.birthYear),
      };
      if (e.name || e.birthYear) people[p.id] = e;
    }
    if (Object.keys(people).length > 0) errors.people = people;
    if (draft.address.trim().length < 3) errors.address = 'Vui lòng nhập địa chỉ.';
  }
  return errors;
}

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ templeId: string; offeringId?: string; mode?: Mode }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const temple = getTemple(params.templeId);
  const initialOffering = getOffering(params.offeringId);

  // Default to offering + petition; only the explicit "chỉ viết sớ" link opens another mode.
  const [mode, setMode] = useState<Mode>(params.mode ?? 'both');
  const [offeringId, setOfferingId] = useState<string | null>(initialOffering?.id ?? null);
  const [draft, setDraft] = useState<PetitionDraft>(() => ({
    typeId: PETITION_TYPES[0].id,
    people: [newPerson('self', user?.name ?? '')],
    address: '',
    wish: '',
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!temple || !user) {
    return (
      <View style={styles.missing}>
        <AppText>Không tìm thấy thông tin lễ.</AppText>
      </View>
    );
  }

  const withOffering = mode !== 'petition';
  const withPetition = mode !== 'offering';
  const offering = withOffering ? getOffering(offeringId ?? undefined) : undefined;
  const total = offering?.price ?? 0;
  const isMemorial = draft.typeId === MEMORIAL_TYPE_ID;
  const hasSelf = draft.people.some((p) => p.relation === 'self');

  const updateDraft = (patch: Partial<PetitionDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const updatePerson = (id: string, patch: Partial<PetitionPerson>) =>
    setDraft((d) => ({ ...d, people: d.people.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const removePerson = (id: string) =>
    setDraft((d) => ({ ...d, people: d.people.filter((p) => p.id !== id) }));
  const addPerson = () =>
    setDraft((d) => ({ ...d, people: [...d.people, newPerson(isMemorial ? 'grandparent' : 'other')] }));

  const selectType = (typeId: string) => {
    setDraft((d) => {
      if (typeId !== MEMORIAL_TYPE_ID) return { ...d, typeId };
      // The deceased can't be the user: turn "Bản thân" into a blank entry to fill in.
      return {
        ...d,
        typeId,
        people: d.people.map((p) =>
          p.relation === 'self' ? { ...p, relation: 'other', name: p.name === user.name ? '' : p.name } : p,
        ),
      };
    });
  };

  const personTitle = (index: number) => {
    if (isMemorial) return `Hương linh ${index + 1}`;
    return index === 0 ? 'Tín chủ (người đứng sớ)' : `Người thân ${index}`;
  };

  const petition: Petition = {
    ...draft,
    requesterName: user.name,
    people: draft.people.map((p) => ({ ...p, name: p.name.trim(), birthYear: p.birthYear?.trim() || undefined })),
    address: draft.address.trim(),
    wish: draft.wish.trim(),
  };

  const submitLabel =
    mode === 'both'
      ? `Dâng lễ & gửi sớ · ${formatVND(total)}`
      : mode === 'offering'
        ? `Dâng lễ · ${formatVND(total)}`
        : 'Gửi sớ';

  const handleSubmit = async () => {
    const nextErrors = validate(mode, offeringId, draft);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const order = await createOrder({
        userId: user.id,
        templeId: temple.id,
        offeringId: offering?.id,
        offeringName: offering?.name,
        total,
        petition: withPetition ? petition : undefined,
      });
      router.replace({ pathname: '/order/[id]', params: { id: order.id, submitted: '1' } });
    } catch {
      setErrors({ form: 'Gửi thất bại, vui lòng thử lại.' });
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen options={{ title: 'Dâng lễ & viết sớ' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.summary}>
          <Image source={temple.image} style={styles.thumb} contentFit="cover" />
          <View style={styles.flex}>
            <AppText style={styles.templeName}>{temple.name}</AppText>
            <AppText style={styles.muted}>{temple.province}</AppText>
          </View>
        </View>

        <AppText style={styles.section}>Bạn muốn</AppText>
        <View style={styles.segment} accessibilityRole="radiogroup">
          {MODES.map((m) => {
            const selected = mode === m.value;
            return (
              <Pressable
                key={m.value}
                onPress={() => setMode(m.value)}
                style={[styles.segmentItem, selected && styles.segmentSelected]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
              >
                <AppText style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                  {m.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {withOffering ? (
          <>
            <AppText style={styles.section}>Chọn lễ</AppText>
            {errors.offering ? <AppText style={styles.error}>{errors.offering}</AppText> : null}
            <View style={styles.offerings}>
              {offeringsFor(temple).map((o) => (
                <OfferingOption
                  key={o.id}
                  offering={o}
                  selected={o.id === offeringId}
                  onPress={() => setOfferingId(o.id)}
                />
              ))}
            </View>
          </>
        ) : null}

        {withPetition ? (
          <>
            <AppText style={styles.section}>Loại sớ</AppText>
            <View style={styles.chips}>
              {PETITION_TYPES.map((t) => (
                <Chip
                  key={t.id}
                  label={t.name}
                  selected={draft.typeId === t.id}
                  onPress={() => selectType(t.id)}
                />
              ))}
            </View>

            <AppText style={styles.section}>
              {isMemorial ? 'Hương linh được cầu siêu' : 'Người được cầu nguyện'}
            </AppText>
            <AppText style={styles.hint}>
              {isMemorial
                ? 'Nhập tên người đã khuất. Bạn là người đứng sớ.'
                : 'Bạn có thể viết sớ cho bản thân, hoặc viết hộ người thân, bạn bè. Người đầu tiên là tín chủ đứng sớ.'}
            </AppText>
            {draft.people.map((p, i) => (
              <PersonEditor
                key={p.id}
                person={p}
                title={personTitle(i)}
                allowSelf={!isMemorial && !hasSelf}
                canRemove={draft.people.length > 1}
                errors={errors.people?.[p.id]}
                onChange={(patch) => updatePerson(p.id, patch)}
                onRemove={() => removePerson(p.id)}
              />
            ))}
            {draft.people.length < MAX_PEOPLE ? (
              <Pressable onPress={addPerson} style={styles.addPerson} accessibilityRole="button">
                <AppText style={styles.addPersonText}>
                  + {isMemorial ? 'Thêm hương linh' : 'Thêm người'}
                </AppText>
              </Pressable>
            ) : null}

            <AppTextInput
              label="Địa chỉ gia đình"
              placeholder="VD: Phường Hoàn Kiếm, Hà Nội"
              value={draft.address}
              onChangeText={(address) => updateDraft({ address })}
              error={errors.address}
              autoComplete="street-address"
            />
            <AppTextInput
              label={`Lời nguyện (${draft.wish.length}/${MAX_WISH_LENGTH})`}
              placeholder="Điều bạn muốn cầu nguyện…"
              value={draft.wish}
              onChangeText={(wish) => updateDraft({ wish })}
              maxLength={MAX_WISH_LENGTH}
              multiline
              textAlignVertical="top"
              style={styles.wish}
            />

            <AppText style={styles.section}>Xem trước sớ</AppText>
            <View style={styles.preview}>
              <AppText style={styles.previewText}>
                {buildPetitionText(petition, temple, new Date().toISOString())}
              </AppText>
            </View>
          </>
        ) : null}

        {errors.form ? <AppText style={styles.formError}>{errors.form}</AppText> : null}
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + SPACING.sm }]}>
        {withOffering ? (
          <View style={styles.totalRow}>
            <AppText style={styles.muted}>{offering ? offering.name : 'Chưa chọn lễ'}</AppText>
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
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },
  templeName: {
    fontWeight: '700',
    fontSize: 17,
  },
  muted: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: -4,
    marginBottom: SPACING.sm,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  segmentSelected: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextSelected: {
    color: '#FFFFFF',
  },
  offerings: {
    gap: SPACING.sm,
  },
  error: {
    color: COLORS.danger,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  addPerson: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: SPACING.lg,
  },
  addPersonText: {
    color: COLORS.primary,
    fontWeight: '600',
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
    gap: SPACING.md,
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
