import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import AppText from '../common/AppText';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { KIND_LABELS, type Temple } from '../../data/temples';

type TempleCardProps = {
  temple: Temple;
  onPress: () => void;
};

export default function TempleCard({ temple, onPress }: TempleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${temple.name}, ${temple.province}`}
    >
      <Image source={temple.image} style={styles.image} contentFit="cover" transition={200} />
      <View style={styles.badge}>
        <AppText style={styles.badgeText}>{KIND_LABELS[temple.kind]}</AppText>
      </View>
      <View style={styles.body}>
        <AppText style={styles.name} numberOfLines={1}>
          {temple.name}
        </AppText>
        <AppText style={styles.province} numberOfLines={1}>
          {temple.province}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: COLORS.border,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(45, 36, 30, 0.75)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    padding: 12,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  province: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
