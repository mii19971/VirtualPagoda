import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

type AppTextInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export default function AppTextInput({
  label,
  error,
  style,
  ...props
}: AppTextInputProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.label}>{label}</AppText>
      <TextInput
        {...props}
        placeholderTextColor={COLORS.textSecondary}
        style={[styles.input, error ? styles.inputError : null, style]}
      />
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  error: {
    fontSize: 13,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
});
