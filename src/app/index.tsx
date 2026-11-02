import { View, StyleSheet, Alert } from 'react-native';
import AppText from '../components/common/AppText';
import AppButton from '../components/common/AppButton';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>
        Virtual Pagoda
      </AppText>

      <AppText style={styles.description}>
        Chào mừng bạn đến với không gian tâm linh số.
      </AppText>

      <AppButton
        title="Bắt đầu"
        onPress={() => Alert.alert('Virtual Pagoda', 'Bạn đã nhấn nút!')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  description: {
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
});