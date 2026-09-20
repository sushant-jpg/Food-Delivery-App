import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

export function FeedbackBanner({ message, type = 'error' }) {
  if (!message) return null;
  return (
    <View style={[styles.banner, type === 'success' && styles.successBanner]}>
      <Text style={[styles.text, type === 'success' && styles.successText]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.dangerSurface, padding: spacing.md, borderRadius: radii.sm, marginBottom: spacing.md },
  successBanner: { backgroundColor: colors.successSurface },
  text: { color: colors.danger, lineHeight: 20 },
  successText: { color: colors.success },
});

