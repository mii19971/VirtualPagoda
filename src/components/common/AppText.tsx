import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

type AppTextProps = TextProps & {
  children: React.ReactNode;
};

export default function AppText({
  children,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[styles.text, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: COLORS.text,
  },
});