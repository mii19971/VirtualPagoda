import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import AppText from '@/components/common/AppText';
import { COLORS } from '@/constants/colors';

/** The receipt photo, shown next to the form so staff can compare. Tap to enlarge. */
export default function ReceiptPhotoView({ uri }: { uri: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      accessibilityRole="imagebutton"
      accessibilityLabel={expanded ? 'Thu nhỏ ảnh phiếu' : 'Phóng to ảnh phiếu'}
    >
      <Image
        source={{ uri }}
        style={[styles.image, expanded && styles.expanded]}
        contentFit="contain"
      />
      <AppText style={styles.hint}>{expanded ? 'Chạm để thu nhỏ' : 'Chạm để phóng to'}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  expanded: {
    height: 560,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
