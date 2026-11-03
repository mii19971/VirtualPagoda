import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import AppText from '../common/AppText';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import type { Offering } from '../../data/offerings';
import { formatVND } from '../../lib/format';

type OfferingOptionProps = {
  offering: Offering;
  selected: boolean;
  onPress: () => void;
};

export default function OfferingOption({ offering, selected, onPress }: OfferingOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${offering.name}, ${formatVND(offering.price)}`}
    >
      <View style={styles.header}>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
        <AppText style={styles.name}>{offering.name}</AppText>
        <AppText style={styles.price}>{formatVND(offering.price)}</AppText>
      </View>
      <AppText style={styles.description}>{offering.description}</AppText>
      <AppText style={styles.items}>{offering.items.join(' · ')}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: 6,
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FBF3EA',
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  name: {
    flex: 1,
    fontWeight: '700',
  },
  price: {
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  items: {
    fontSize: 13,
    color: COLORS.text,
  },
});
