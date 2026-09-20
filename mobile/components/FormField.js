import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

export function FormField({ label, error, ...inputProps }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#98A099"
        style={[styles.input, inputProps.multiline && styles.multiline, error && styles.inputError]}
        autoCapitalize="none"
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs, marginBottom: spacing.md },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    fontSize: 16,
  },
  multiline: { minHeight: 96, paddingTop: spacing.md, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12 },
});

