import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../../constants/colors';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export default function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <AppText style={[styles.label, selected && styles.selectedLabel]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  selected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
  },
  selectedLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
