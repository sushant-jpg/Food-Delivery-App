import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

export default function Index() {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.status === 'pending') return <Redirect href="/pending-approval" />;
  if (user.role === 'restaurant') return <Redirect href="/(restaurant)/dashboard" />;
  if (user.role === 'rider') return <Redirect href="/(rider)/dashboard" />;
  if (user.role === 'admin') return <Redirect href="/(admin)/dashboard" />;
  return <Redirect href="/(customer)/home" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});

