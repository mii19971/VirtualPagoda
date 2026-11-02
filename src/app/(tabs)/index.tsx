import { View, StyleSheet, Alert } from 'react-native';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { useAuth } from '../../context/auth-context';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>
        Virtual Pagoda
      </AppText>

      <AppText style={styles.description}>
        Xin chào {user?.name}, chào mừng bạn đến với không gian tâm linh số.
      </AppText>

      <AppButton
        title="Bắt đầu"
        onPress={() => Alert.alert('Virtual Pagoda', 'Bạn đã nhấn nút!')}
      />

      <View style={styles.signOut}>
        <AppButton title="Đăng xuất" onPress={signOut} />
      </View>
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
  signOut: {
    marginTop: SPACING.md,
  },
});
