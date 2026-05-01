import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ticketTypeApi } from '../../api/ticketTypeApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { colors } from '../../constants/colors';
import { isNonNegativeNumber, isPositiveInt, isRequired } from '../../utils/validators';

export default function AddTicketTypeScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [availableQuantity, setAvailableQuantity] = useState('1');
  const [status, setStatus] = useState('Active');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setError('');
    if (!isRequired(name)) return setError('Name is required.');
    if (!isNonNegativeNumber(price)) return setError('Price must be greater than or equal to 0.');
    if (!isPositiveInt(totalQuantity)) return setError('Total quantity must be greater than 0.');
    if (!isPositiveInt(availableQuantity)) return setError('Available quantity must be greater than 0.');
    if (Number(availableQuantity) > Number(totalQuantity)) return setError('Available quantity cannot be greater than total quantity.');
    if (!['Active', 'Inactive'].includes(status)) return setError('Status must be Active or Inactive.');

    try {
      setSaving(true);
      await ticketTypeApi.create({ name: name.trim(), description, price: Number(price), totalQuantity: Number(totalQuantity), availableQuantity: Number(availableQuantity), status });
      Alert.alert('Success', 'Ticket type created');
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.shell}>
          <View style={styles.headerCard}>
            <Text style={styles.kicker}>Ticket setup</Text>
            <Text style={styles.title}>Create ticket type</Text>
            <Text style={styles.subtitle}>Define pricing, capacity, and availability for event reservations.</Text>
          </View>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Ticket information</Text>
            <ErrorMessage message={error} />
            <AppInput label="Ticket name" value={name} onChangeText={setName} placeholder="Student Pass" />
            <AppInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional description" />
            <View style={styles.twoColumn}>
              <View style={styles.fieldColumn}><AppInput label="Price" value={price} onChangeText={setPrice} placeholder="0" keyboardType="numeric" /></View>
              <View style={styles.fieldColumn}><AppInput label="Status" value={status} onChangeText={setStatus} placeholder="Active / Inactive" /></View>
            </View>
            <View style={styles.twoColumn}>
              <View style={styles.fieldColumn}><AppInput label="Total Quantity" value={totalQuantity} onChangeText={setTotalQuantity} placeholder="100" keyboardType="numeric" /></View>
              <View style={styles.fieldColumn}><AppInput label="Available Quantity" value={availableQuantity} onChangeText={setAvailableQuantity} placeholder="100" keyboardType="numeric" /></View>
            </View>
            <Text style={styles.helperText}>Availability must not exceed total quantity. Status should be Active or Inactive.</Text>
            <AppButton title={saving ? 'Saving...' : 'Create ticket type'} onPress={onSave} disabled={saving} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: colors.background },
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  shell: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  headerCard: { backgroundColor: colors.card, borderRadius: 28, padding: 22, borderWidth: 1, borderColor: colors.border, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 3 },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { marginTop: 7, color: colors.text, fontSize: 29, fontWeight: '900', lineHeight: 35, letterSpacing: -0.5 },
  subtitle: { color: colors.muted, marginTop: 8, lineHeight: 22 },
  formCard: { backgroundColor: colors.card, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '900', marginBottom: 12 },
  twoColumn: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  fieldColumn: { flex: 1, minWidth: 220 },
  helperText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: -4, marginBottom: 12 },
});
