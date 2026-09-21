import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { FormField } from '../../components/FormField';
import { PageHeader } from '../../components/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StatePanel } from '../../components/StatePanel';
import { colors, radii, spacing } from '../../constants/theme';
import { api, getApiErrorMessage } from '../../services/api';

const blankItem = (category = '') => ({
  category,
  name: '',
  description: '',
  image: '',
  price: '',
  discountPrice: '',
  preparationTime: '20',
  isVegetarian: false,
  isAvailable: true,
});

export default function RestaurantMenuScreen() {
  const [data, setData] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDrafts, setCategoryDrafts] = useState({});
  const [itemForm, setItemForm] = useState(blankItem());
  const [editingItemId, setEditingItemId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const next = (await api.get('/menu')).data.data;
      setData(next);
      setCategoryDrafts(Object.fromEntries(next.categories.map((category) => [category._id, category.name])));
      setItemForm((current) => ({ ...current, category: current.category || next.categories[0]?._id || '' }));
      return next;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const createCategory = async () => {
    if (!categoryName.trim()) return;
    setError('');
    try {
      const created = (await api.post('/menu/categories', { name: categoryName.trim() })).data.data.category;
      setCategoryName('');
      await load();
      setItemForm((current) => ({ ...current, category: current.category || created._id }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const saveCategory = async (category) => {
    try {
      await api.patch(`/menu/categories/${category._id}`, { name: categoryDrafts[category._id] });
      setNotice('Category updated.');
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const deleteCategory = (category) => Alert.alert('Delete category?', 'Only empty categories can be deleted.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          await api.delete(`/menu/categories/${category._id}`);
          await load();
        } catch (requestError) {
          setError(getApiErrorMessage(requestError));
        }
      },
    },
  ]);

  const updateItemField = (field) => (value) => setItemForm((current) => ({ ...current, [field]: value }));

  const resetItemForm = () => {
    setEditingItemId(null);
    setItemForm(blankItem(data?.categories[0]?._id || ''));
  };

  const saveItem = async () => {
    if (!itemForm.category) return setError('Create and select a category first.');
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      ...itemForm,
      price: Number(itemForm.price),
      discountPrice: itemForm.discountPrice === '' ? null : Number(itemForm.discountPrice),
      preparationTime: Number(itemForm.preparationTime),
    };
    try {
      if (editingItemId) await api.patch(`/menu/items/${editingItemId}`, payload);
      else await api.post('/menu/items', payload);
      setNotice(editingItemId ? 'Menu item updated.' : 'Menu item created.');
      resetItemForm();
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setEditingItemId(item._id);
    setItemForm({
      category: String(item.category),
      name: item.name,
      description: item.description,
      image: item.image || '',
      price: String(item.price),
      discountPrice: item.discountPrice === null ? '' : String(item.discountPrice),
      preparationTime: String(item.preparationTime),
      isVegetarian: item.isVegetarian,
      isAvailable: item.isAvailable,
    });
  };

  const toggleItem = async (item) => {
    try {
      await api.patch(`/menu/items/${item._id}/availability`, { isAvailable: !item.isAvailable });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const deleteItem = (item) => Alert.alert('Delete menu item?', item.name, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          await api.delete(`/menu/items/${item._id}`);
          await load();
        } catch (requestError) {
          setError(getApiErrorMessage(requestError));
        }
      },
    },
  ]);

  if (loading && !data) return <Screen><StatePanel loading title="Loading menu" /></Screen>;
  if (!data) return <Screen><StatePanel title="Menu unavailable" message={error} actionLabel="Retry" onAction={load} /></Screen>;

  return (
    <Screen scroll keyboard>
      <PageHeader title="Menu management" subtitle="Categories and items published here appear in the customer app." />
      <FeedbackBanner message={error} />
      <FeedbackBanner message={notice} type="success" />

      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.inline}>
        <TextInput
          value={categoryName}
          onChangeText={setCategoryName}
          placeholder="New category name"
          placeholderTextColor="#8C958E"
          style={styles.inlineInput}
        />
        <Pressable onPress={createCategory} style={styles.smallButton}><Text style={styles.smallButtonText}>Add</Text></Pressable>
      </View>
      <View style={styles.categoryList}>
        {data.categories.map((category) => (
          <View key={category._id} style={styles.categoryRow}>
            <TextInput
              value={categoryDrafts[category._id] || ''}
              onChangeText={(value) => setCategoryDrafts((current) => ({ ...current, [category._id]: value }))}
              style={styles.categoryInput}
            />
            <Pressable onPress={() => saveCategory(category)}><Text style={styles.link}>Save</Text></Pressable>
            <Pressable onPress={() => deleteCategory(category)}><Text style={styles.delete}>Delete</Text></Pressable>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{editingItemId ? 'Edit menu item' : 'Create menu item'}</Text>
      {data.categories.length === 0 ? <StatePanel title="Create a category first" message="Every menu item must belong to your restaurant’s category." /> : null}
      {data.categories.length > 0 ? (
        <>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryChoices}>
            {data.categories.map((category) => (
              <Pressable key={category._id} onPress={() => updateItemField('category')(category._id)} style={[styles.choice, itemForm.category === category._id && styles.choiceActive]}>
                <Text style={[styles.choiceText, itemForm.category === category._id && styles.choiceTextActive]}>{category.name}</Text>
              </Pressable>
            ))}
          </View>
          <FormField label="Name" value={itemForm.name} onChangeText={updateItemField('name')} autoCapitalize="words" />
          <FormField label="Description" value={itemForm.description} onChangeText={updateItemField('description')} multiline autoCapitalize="sentences" />
          <FormField label="Image URL (optional)" value={itemForm.image} onChangeText={updateItemField('image')} keyboardType="url" />
          <View style={styles.twoColumns}>
            <View style={styles.half}><FormField label="Price (Rs)" value={itemForm.price} onChangeText={updateItemField('price')} keyboardType="decimal-pad" /></View>
            <View style={styles.half}><FormField label="Discount price" value={itemForm.discountPrice} onChangeText={updateItemField('discountPrice')} keyboardType="decimal-pad" /></View>
          </View>
          <FormField label="Preparation time (minutes)" value={itemForm.preparationTime} onChangeText={updateItemField('preparationTime')} keyboardType="number-pad" />
          <View style={styles.switches}>
            <View style={styles.switchRow}><Text style={styles.switchText}>Vegetarian</Text><Switch value={itemForm.isVegetarian} onValueChange={updateItemField('isVegetarian')} trackColor={{ true: colors.leaf }} /></View>
            <View style={styles.switchRow}><Text style={styles.switchText}>Available</Text><Switch value={itemForm.isAvailable} onValueChange={updateItemField('isAvailable')} trackColor={{ true: colors.leaf }} /></View>
          </View>
          <View style={styles.formActions}>
            <View style={styles.action}><PrimaryButton title={editingItemId ? 'Save changes' : 'Create item'} loading={saving} onPress={saveItem} /></View>
            {editingItemId ? <View style={styles.action}><PrimaryButton title="Cancel" variant="secondary" onPress={resetItemForm} /></View> : null}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Published menu</Text>
      {data.categories.map((category) => (
        <View key={`list-${category._id}`} style={styles.menuCategory}>
          <Text style={styles.menuCategoryTitle}>{category.name}</Text>
          {category.items.length === 0 ? <Text style={styles.empty}>No items in this category.</Text> : null}
          {category.items.map((item) => (
            <View key={item._id} style={styles.itemRow}>
              <View style={styles.itemCopy}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>Rs {item.discountPrice ?? item.price} · {item.preparationTime} min · {item.isAvailable ? 'Available' : 'Unavailable'}</Text>
              </View>
              <Pressable onPress={() => editItem(item)}><Text style={styles.link}>Edit</Text></Pressable>
              <Pressable onPress={() => toggleItem(item)}><Text style={styles.link}>{item.isAvailable ? 'Pause' : 'Enable'}</Text></Pressable>
              <Pressable onPress={() => deleteItem(item)}><Text style={styles.delete}>Delete</Text></Pressable>
            </View>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', marginTop: spacing.lg, marginBottom: spacing.md },
  inline: { flexDirection: 'row', gap: spacing.sm },
  inlineInput: { flex: 1, minHeight: 50, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, color: colors.ink },
  smallButton: { minWidth: 70, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  smallButtonText: { color: '#FFFFFF', fontWeight: '900' },
  categoryList: { gap: spacing.sm, marginTop: spacing.md },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm },
  categoryInput: { flex: 1, color: colors.ink, minHeight: 38, paddingHorizontal: spacing.sm },
  link: { color: colors.primary, fontWeight: '800' },
  delete: { color: colors.danger, fontWeight: '800' },
  fieldLabel: { color: colors.ink, fontWeight: '800', marginBottom: spacing.sm },
  categoryChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  choice: { backgroundColor: colors.surface, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  choiceActive: { backgroundColor: colors.leaf },
  choiceText: { color: colors.ink, fontWeight: '800' },
  choiceTextActive: { color: '#FFFFFF' },
  twoColumns: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  switches: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  switchRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md },
  switchText: { color: colors.ink, fontWeight: '800' },
  formActions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
  menuCategory: { marginBottom: spacing.lg },
  menuCategoryTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginBottom: spacing.sm },
  empty: { color: colors.muted },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm },
  itemCopy: { flex: 1 },
  itemName: { color: colors.ink, fontWeight: '900' },
  itemMeta: { color: colors.muted, marginTop: spacing.xs },
});
