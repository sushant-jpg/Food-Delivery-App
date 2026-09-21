import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';
import { PrimaryButton } from './PrimaryButton';

export function StatePanel({ title, message, loading = false, actionLabel, onAction }) {
  return (
    <View style={styles.panel}>
      {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel ? <View style={styles.action}><PrimaryButton title={actionLabel} onPress={onAction} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  title: { color: colors.ink, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  message: { color: colors.muted, lineHeight: 21, textAlign: 'center' },
  action: { alignSelf: 'stretch', marginTop: spacing.sm },
});

