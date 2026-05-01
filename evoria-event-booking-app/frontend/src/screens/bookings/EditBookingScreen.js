import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { bookingApi } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors } from '../../constants/colors';
import { isPositiveInt } from '../../utils/validators';

export default function EditBookingScreen({ route, navigation }) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [status, setStatus] = useState('Pending');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await bookingApi.getById(id);
        const b = res.data;
        setQuantity(String(b?.quantity ?? 1));
        setStatus(b?.status || 'Pending');
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSave = async () => {
    setError('');
    if (!isPositiveInt(quantity)) return setError('Quantity must be greater than 0.');
    if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) return setError('Status must be Pending, Confirmed, or Cancelled.');
    try {
      setSaving(true);
      await bookingApi.update(id, { quantity: Number(quantity), status });
      Alert.alert('Success', 'Booking updated');
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.shell}>
          <View style={styles.headerCard}>
            <Text style={styles.kicker}>Edit booking</Text>
            <Text style={styles.title}>Update reservation status</Text>
            <Text style={styles.subtitle}>Adjust quantity and keep the booking lifecycle accurate.</Text>
          </View>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Booking controls</Text>
            <ErrorMessage message={error} />
            <AppInput label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="1" keyboardType="numeric" />
            <AppInput label="Status" value={status} onChangeText={setStatus} placeholder="Pending / Confirmed / Cancelled" />
            <Text style={styles.helperText}>Use one of: Pending, Confirmed, Cancelled.</Text>
            <AppButton title={saving ? 'Saving...' : 'Save changes'} onPress={onSave} disabled={saving} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: colors.background },
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  shell: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  headerCard: { backgroundColor: colors.card, borderRadius: 28, padding: 22, borderWidth: 1, borderColor: colors.border, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 3 },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { marginTop: 7, color: colors.text, fontSize: 29, fontWeight: '900', lineHeight: 35, letterSpacing: -0.5 },
  subtitle: { color: colors.muted, marginTop: 8, lineHeight: 22 },
  formCard: { backgroundColor: colors.card, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '900', marginBottom: 12 },
  helperText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: -4, marginBottom: 12 },
});
