import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import OfferingOption from '@/components/temple/OfferingOption';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { offeringsFor } from '@/data/offerings';
import { KIND_LABELS, REGION_LABELS, getTemple } from '@/data/temples';
import { formatVND } from '@/lib/format';

export default function TempleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const temple = getTemple(id);
  const insets = useSafeAreaInsets();
  const [offeringId, setOfferingId] = useState<string | null>(null);

  if (!temple) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'Không tìm thấy' }} />
        <AppText>Không tìm thấy chùa hoặc đền này.</AppText>
      </View>
    );
  }

  const offerings = offeringsFor(temple);
  const selected = offerings.find((o) => o.id === offeringId);

  // The checkout screen lets the user switch between offering, petition, or both.
  const goToCheckout = (petitionOnly: boolean) =>
    router.push({
      pathname: '/checkout',
      params: petitionOnly
        ? { templeId: temple.id, mode: 'petition' }
        : { templeId: temple.id, ...(selected ? { offeringId: selected.id } : {}) },
    });

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: temple.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={temple.image}
          style={styles.hero}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`Ảnh ${temple.name}`}
        />
        <Pressable onPress={() => Linking.openURL(temple.credit.url)} accessibilityRole="link">
          <AppText style={styles.credit}>
            Ảnh: {temple.credit.author} · {temple.credit.license} · Wikimedia Commons
          </AppText>
        </Pressable>

        <View style={styles.inner}>
          <AppText style={styles.meta}>
            {KIND_LABELS[temple.kind]} · {temple.province} · {REGION_LABELS[temple.region]}
          </AppText>
          <AppText style={styles.name}>{temple.name}</AppText>
          <AppText style={styles.description}>{temple.description}</AppText>

          <AppText style={styles.section}>Chọn lễ</AppText>
          <AppText style={styles.hint}>Giá tham khảo, đã bao gồm chi phí sắp lễ tại {temple.name}.</AppText>
          <View style={styles.offerings}>
            {offerings.map((o) => (
              <OfferingOption
                key={o.id}
                offering={o}
                selected={o.id === offeringId}
                onPress={() => setOfferingId(o.id === offeringId ? null : o.id)}
              />
            ))}
          </View>

          <Pressable
            onPress={() => goToCheckout(false)}
            style={styles.petitionOnly}
            accessibilityRole="button"
          >
            <AppText style={styles.petitionOnlyText}>Viết sớ và dâng lễ ›</AppText>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + SPACING.sm }]}>
        <View style={styles.barInfo}>
          <AppText style={styles.barLabel} numberOfLines={1}>
            {selected ? selected.name : 'Chưa chọn lễ'}
          </AppText>
          <AppText style={styles.barPrice}>{formatVND(selected?.price ?? 0)}</AppText>
        </View>
        <View style={styles.barButton}>
          <AppButton title="Tiếp tục" onPress={() => goToCheckout(false)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xl,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  hero: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: COLORS.border,
  },
  credit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  inner: {
    padding: SPACING.md,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  description: {
    lineHeight: 24,
  },
  section: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: SPACING.lg,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  offerings: {
    gap: SPACING.sm,
  },
  petitionOnly: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  petitionOnlyText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  barInfo: {
    flex: 1,
  },
  barLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  barPrice: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  barButton: {
    minWidth: 140,
  },
});
