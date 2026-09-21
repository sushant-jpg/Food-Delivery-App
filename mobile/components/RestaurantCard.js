import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

export function RestaurantCard({ restaurant, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {restaurant.image ? (
        <Image source={{ uri: restaurant.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}><Text style={styles.placeholderText}>ND</Text></View>
      )}
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.rating}>★ {Number(restaurant.rating || 0).toFixed(1)}</Text>
        </View>
        <Text numberOfLines={1} style={styles.cuisine}>{restaurant.cuisines?.join(' · ') || 'Local food'}</Text>
        <Text style={styles.meta}>{Number(restaurant.distanceKm || 0).toFixed(1)} km away · Rs {restaurant.deliveryFee}</Text>
        <Text style={[styles.status, !restaurant.isOpen && styles.closed]}>{restaurant.isOpen ? restaurant.estimatedDeliveryTime : 'Currently closed'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.86 },
  image: { width: '100%', height: 142 },
  placeholder: { backgroundColor: '#E7EFE9', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: colors.leaf, fontSize: 28, fontWeight: '900' },
  copy: { padding: spacing.md, gap: spacing.xs },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  name: { flex: 1, color: colors.ink, fontSize: 18, fontWeight: '900' },
  rating: { color: colors.ink, fontWeight: '800' },
  cuisine: { color: colors.muted },
  meta: { color: colors.ink, fontWeight: '700' },
  status: { color: colors.success, fontWeight: '800' },
  closed: { color: colors.danger },
});

