import { Alert, Platform } from 'react-native';

import { useAuth } from '@/context/auth-context';

const TITLE = 'Đăng xuất';
const MESSAGE = 'Bạn có chắc muốn đăng xuất khỏi Chùa Nhà?';

/** Returns a handler that asks for confirmation, then signs out (the root guard redirects to /login). */
export function useConfirmSignOut() {
  const { signOut } = useAuth();

  return () => {
    // react-native-web's Alert ignores buttons, so use the browser dialog there.
    if (Platform.OS === 'web') {
      if (window.confirm(MESSAGE)) void signOut();
      return;
    }
    Alert.alert(TITLE, MESSAGE, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => void signOut() },
    ]);
  };
}
