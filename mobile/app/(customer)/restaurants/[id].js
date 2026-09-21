import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FeedbackBanner } from '../../../components/FeedbackBanner';
import { PageHeader } from '../../../components/PageHeader';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { Screen } from '../../../components/Screen';
import { StatePanel } from '../../../components/StatePanel';
import { colors, radii, spacing } from '../../../constants/theme';
import { api, getApiErrorMessage } from '../../../services/api';

export default function RestaurantDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const addressesResponse = await api.get('/addresses');
      const addresses = addressesResponse.data.data.addresses;
      const selected = addresses.find((address) => address.isDefault) || addresses[0];
      const params = {};
      if (selected) [params.longitude, params.latitude] = selected.location.coordinates;
      const response = await api.get(`/restaurants/${id}`, { params });
      setRestaurant(response.data.data.restaurant);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const add = async (menuItemId, replaceExisting = false) => {
    setAddingId(menuItemId);
    setNotice('');
    try {
      await api.post('/cart/items', { menuItemId, quantity: 1, replaceExisting });
      setNotice('Added to cart.');
    } catch (requestError) {
      if (requestError.response?.data?.details?.code === 'CART_RESTAURANT_CONFLICT') {
        Alert.alert(
          'Start a new cart?',
          'Your cart contains food from another restaurant.\n\nClear the current cart and continue?',
          [
            { text: 'Keep current cart', style: 'cancel' },
            { text: 'Clear and continue', style: 'destructive', onPress: () => add(menuItemId, true) },
          ],
        );
      } else {
        setNotice(getApiErrorMessage(requestError));
      }
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <Screen><StatePanel loading title="Loading restaurant" /></Screen>;
  if (error || !restaurant) {
    return <Screen><PageHeader title="Restaurant unavailable" /><StatePanel title="Couldn’t open this restaurant" message={error} actionLabel="Retry" onAction={load} /></Screen>;
  }

  const itemCount = restaurant.categories.reduce((count, category) => count + category.items.length, 0);

  return (
    <Screen scroll>
      <PageHeader title={restaurant.name} actionLabel="Cart" onAction={() => router.push('/(customer)/cart')} />
      {restaurant.coverImage || restaurant.image ? (
        <Image source={{ uri: restaurant.coverImage || restaurant.image }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}><Text style={styles.coverText}>Nepalgunj local kitchen</Text></View>
      )}
      <View style={styles.summary}>
        <Text style={styles.cuisines}>{restaurant.cuisines?.join(' · ')}</Text>
        <Text style={styles.description}>{restaurant.description}</Text>
        <Text style={styles.meta}>★ {Number(restaurant.rating || 0).toFixed(1)} · {Number(restaurant.distanceKm || 0).toFixed(1)} km away</Text>
        <Text style={styles.meta}>Rs {restaurant.deliveryFee} delivery · {restaurant.estimatedDeliveryTime}</Text>
        <Text style={styles.meta}>Open {restaurant.openingTime}–{restaurant.closingTime}</Text>
        <Text style={[styles.openStatus, !restaurant.isOpen && styles.closed]}>{restaurant.isOpen ? 'Open now' : 'Restaurant closed'}</Text>
      </View>
      {!restaurant.isOpen ? <FeedbackBanner message="This restaurant is currently closed. You can browse the menu, but adding items is disabled." /> : null}
      <FeedbackBanner message={notice} type={notice === 'Added to cart.' ? 'success' : 'error'} />

      {itemCount === 0 ? <StatePanel title="Empty menu" message="This restaurant has not published available menu items yet." /> : null}
      {restaurant.categories.map((category) => (
        <View key={category.id} style={styles.category}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          {category.items.map((item) => {
            const hasDiscount = item.discountPrice !== null && item.discountPrice < item.price;
            return (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemCopy}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.isVegetarian ? <Text style={styles.vegetarian}>VEG</Text> : null}
                  </View>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>Rs {hasDiscount ? item.discountPrice : item.price}</Text>
                    {hasDiscount ? <Text style={styles.oldPrice}>Rs {item.price}</Text> : null}
                    <Text style={styles.prep}>· {item.preparationTime} min</Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  disabled={!restaurant.isOpen || addingId === item.id}
                  onPress={() => add(item.id)}
                  style={[styles.addButton, (!restaurant.isOpen || addingId === item.id) && styles.disabled]}
                >
                  <Text style={styles.addText}>{addingId === item.id ? '…' : '+ Add'}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
      {itemCount > 0 ? <PrimaryButton title="View cart" variant="secondary" onPress={() => router.push('/(customer)/cart')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 210, borderRadius: radii.lg, marginBottom: spacing.lg },
  coverPlaceholder: { backgroundColor: '#E7EFE9', alignItems: 'center', justifyContent: 'center' },
  coverText: { color: colors.leaf, fontWeight: '900', fontSize: 18 },
  summary: { gap: spacing.xs, marginBottom: spacing.lg },
  cuisines: { color: colors.primary, fontWeight: '900' },
  description: { color: colors.muted, lineHeight: 21, marginVertical: spacing.xs },
  meta: { color: colors.ink, fontWeight: '700' },
  openStatus: { color: colors.success, fontWeight: '900', marginTop: spacing.xs },
  closed: { color: colors.danger },
  category: { marginBottom: spacing.xl },
  categoryTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', marginBottom: spacing.md },
  item: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm },
  itemCopy: { flex: 1 },
  itemTitleRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  itemName: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  vegetarian: { color: colors.success, fontSize: 10, fontWeight: '900' },
  itemDescription: { color: colors.muted, lineHeight: 19, marginTop: spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  price: { color: colors.ink, fontWeight: '900' },
  oldPrice: { color: colors.muted, textDecorationLine: 'line-through' },
  prep: { color: colors.muted },
  addButton: { alignSelf: 'center', backgroundColor: colors.primary, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  addText: { color: '#FFFFFF', fontWeight: '900' },
  disabled: { opacity: 0.45 },
});
