import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { Screen } from './Screen';
import { colors, radii, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export function AccountHome({ eyebrow, title, description, facts = [] }) {
  const { user, profile, logout } = useAuth();
  return (
    <Screen scroll>
      <Text style={styles.brand}>nepalgung<Text style={styles.accent}>daba</Text></Text>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.meta}>{user?.email}</Text>
        <Text style={styles.status}>Active {user?.role} account</Text>
      </View>
      {facts.map((fact) => (
        <View style={styles.fact} key={fact.label}>
          <Text style={styles.factLabel}>{fact.label}</Text>
          <Text style={styles.factValue}>{fact.value(profile)}</Text>
        </View>
      ))}
      <View style={styles.spacer} />
      <PrimaryButton title="Sign out" variant="secondary" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { color: colors.ink, fontSize: 20, fontWeight: '900', marginBottom: spacing.xl },
  accent: { color: colors.primary },
  eyebrow: { color: colors.leaf, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 32, lineHeight: 38, fontWeight: '900' },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: spacing.sm, marginBottom: spacing.xl },
  card: { backgroundColor: colors.ink, padding: spacing.lg, borderRadius: radii.lg, marginBottom: spacing.lg },
  name: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  meta: { color: '#CDD4CF', marginTop: spacing.xs },
  status: { color: '#F6C979', fontWeight: '800', marginTop: spacing.lg, textTransform: 'capitalize' },
  fact: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  factLabel: { color: colors.muted },
  factValue: { color: colors.ink, fontWeight: '800' },
  spacer: { height: spacing.xl },
});

