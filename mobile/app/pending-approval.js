import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { colors, radii, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function PendingApprovalScreen() {
  const { user, logout, refreshAccount } = useAuth();
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.status === 'active') return <Redirect href="/" />;

  return (
    <Screen contentContainerStyle={styles.screen}>
      <View style={styles.icon}><Text style={styles.iconText}>⌛</Text></View>
      <Text style={styles.eyebrow}>APPLICATION RECEIVED</Text>
      <Text style={styles.title}>We’re reviewing your {user.role} account.</Text>
      <Text style={styles.description}>You can’t receive orders or deliveries until an administrator approves your application. Refresh after you’ve been notified.</Text>
      <View style={styles.actions}>
        <PrimaryButton title="Check approval status" onPress={refreshAccount} />
        <PrimaryButton title="Sign out" variant="secondary" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  icon: { width: 64, height: 64, borderRadius: radii.lg, backgroundColor: '#F8E4B8', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  iconText: { fontSize: 28 },
  eyebrow: { color: colors.leaf, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 30, lineHeight: 37, fontWeight: '900' },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: spacing.md },
  actions: { gap: spacing.md, marginTop: spacing.xl },
});

