import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../constants/theme';

export function PageHeader({ title, subtitle, back = true, actionLabel, onAction }) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {back ? (
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.lg },
  copy: { flex: 1 },
  back: { color: colors.primary, fontWeight: '800', marginBottom: spacing.sm },
  title: { color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: '900' },
  subtitle: { color: colors.muted, lineHeight: 21, marginTop: spacing.xs },
  action: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  actionText: { color: colors.primary, fontWeight: '800' },
});

