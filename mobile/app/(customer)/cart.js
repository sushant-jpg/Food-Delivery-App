import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PageHeader } from '../../components/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StatePanel } from '../../components/StatePanel';
import { colors, radii, spacing } from '../../constants/theme';
import { api, getApiErrorMessage } from '../../services/api';

export default function CartScreen() {
  const [data, setData] = useState({ cart: null, subtotal: 0, itemCount: 0 });
  const [instructions, setInstructions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sync = useCallback((next) => {
    setData(next);
    setInstructions(Object.fromEntries((next.cart?.items || []).map((item) => [item._id, item.instructions || ''])));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      sync((await api.get('/cart')).data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [sync]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const updateItem = async (itemId, patch) => {
    setError('');
    try {
      sync((await api.patch(`/cart/items/${itemId}`, patch)).data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const removeItem = async (itemId) => {
    try {
      sync((await api.delete(`/cart/items/${itemId}`)).data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const clear = () => Alert.alert('Clear cart?', 'All items in this cart will be removed.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Clear cart',
      style: 'destructive',
      onPress: async () => {
        try {
          await api.delete('/cart');
          sync({ cart: null, subtotal: 0, itemCount: 0 });
        } catch (requestError) {
          setError(getApiErrorMessage(requestError));
        }
      },
    },
  ]);

  return (
    <Screen scroll keyboard>
      <PageHeader title="Your cart" subtitle={data.cart ? data.cart.restaurant.name : 'One restaurant per cart'} actionLabel={data.cart ? 'Clear' : undefined} onAction={clear} />
      {loading ? <StatePanel loading title="Loading cart" /> : null}
      {!loading && error ? <StatePanel title="Cart update failed" message={error} actionLabel="Retry" onAction={load} /> : null}
      {!loading && !error && !data.cart ? <StatePanel title="Your cart is empty" message="Open a nearby restaurant to add food." /> : null}
      {data.cart?.items.map((item) => (
        <View key={item._id} style={styles.item}>
          <View style={styles.topRow}>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.menuItem.name}</Text>
              <Text style={styles.price}>Rs {item.lineTotal}</Text>
            </View>
            <View style={styles.quantity}>
              <Pressable onPress={() => item.quantity === 1 ? removeItem(item._id) : updateItem(item._id, { quantity: item.quantity - 1 })} style={styles.quantityButton}><Text style={styles.quantityText}>−</Text></Pressable>
              <Text style={styles.count}>{item.quantity}</Text>
              <Pressable onPress={() => updateItem(item._id, { quantity: item.quantity + 1 })} style={styles.quantityButton}><Text style={styles.quantityText}>+</Text></Pressable>
            </View>
          </View>
          <TextInput
            value={instructions[item._id] || ''}
            onChangeText={(value) => setInstructions((current) => ({ ...current, [item._id]: value }))}
            onEndEditing={() => updateItem(item._id, { instructions: instructions[item._id] || '' })}
            placeholder="Special instructions"
            placeholderTextColor="#8C958E"
            style={styles.instructions}
          />
          <Pressable onPress={() => removeItem(item._id)}><Text style={styles.remove}>Remove</Text></Pressable>
        </View>
      ))}
      {data.cart ? (
        <View style={styles.totalCard}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Items</Text><Text style={styles.totalLabel}>{data.itemCount}</Text></View>
          <View style={styles.totalRow}><Text style={styles.total}>Subtotal</Text><Text style={styles.total}>Rs {data.subtotal}</Text></View>
          <Text style={styles.note}>Delivery fee is calculated by the server from your selected address. Checkout is intentionally not enabled yet.</Text>
          <PrimaryButton title="Checkout coming next" disabled onPress={() => {}} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  copy: { flex: 1 },
  name: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  price: { color: colors.muted, fontWeight: '700', marginTop: spacing.xs },
  quantity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  quantityButton: { width: 34, height: 34, borderRadius: radii.pill, backgroundColor: '#E7EFE9', alignItems: 'center', justifyContent: 'center' },
  quantityText: { color: colors.leaf, fontSize: 20, fontWeight: '900' },
  count: { color: colors.ink, minWidth: 20, textAlign: 'center', fontWeight: '900' },
  instructions: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, color: colors.ink, minHeight: 44, paddingHorizontal: spacing.sm, marginTop: spacing.md },
  remove: { color: colors.danger, fontWeight: '800', marginTop: spacing.sm },
  totalCard: { backgroundColor: colors.ink, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: '#CDD4CF' },
  total: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  note: { color: '#CDD4CF', lineHeight: 20 },
});
