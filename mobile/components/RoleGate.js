import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

export function RoleGate({ role, children }) {
  const { user, isBootstrapping } = useAuth();
  if (isBootstrapping) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.status === 'pending') return <Redirect href="/pending-approval" />;
  if (user.role !== role) return <Redirect href="/" />;
  return children;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } });

