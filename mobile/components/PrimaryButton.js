import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

export function PrimaryButton({ title, onPress, loading = false, disabled = false, variant = 'primary' }) {
  const unavailable = loading || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable }}
      onPress={onPress}
      disabled={unavailable}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        unavailable && styles.disabled,
        pressed && !unavailable && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={[styles.title, variant === 'secondary' && styles.secondaryTitle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
  secondaryTitle: { color: colors.primary },
  disabled: { opacity: 0.55 },
  pressed: { transform: [{ scale: 0.99 }] },
});

