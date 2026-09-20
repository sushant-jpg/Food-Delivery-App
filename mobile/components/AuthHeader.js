import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';

export function AuthHeader({ eyebrow = 'NEPALGUNJ', title, subtitle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>nepalgung<Text style={styles.brandAccent}>daba</Text></Text>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.xl },
  brand: { color: colors.ink, fontSize: 20, fontWeight: '900', marginBottom: spacing.xl },
  brandAccent: { color: colors.primary },
  eyebrow: { color: colors.leaf, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 32, lineHeight: 38, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: spacing.sm },
});

