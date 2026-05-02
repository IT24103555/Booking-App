import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, SafeAreaView } from 'react-native';
import { bookingApi } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { isPositiveInt } from '../../utils/validators';

const UI = { primary: '#EC168C', background: '#FFF7FC', surface: '#FFFFFF', text: '#111827', muted: '#7C7C8A', border: '#F0DDEB', softPink: '#FFE7F4' };
const STATUSES = ['Pending', 'Confirmed', 'Cancelled'];

function StatusChip({ label, selected, onPress }) {
  return <TouchableOpacity style={[styles.chip, selected && styles.chipActive]} onPress={onPress}><Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text></TouchableOpacity>;
}

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
        setError(''); setLoading(true);
        const res = await bookingApi.getById(id);
        const b = res.data;
        setQuantity(String(b?.quantity ?? 1));
        setStatus(b?.status || 'Pending');
      } catch (e) { setError(getErrorMessage(e)); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const onSave = async () => {
    setError('');
    if (!isPositiveInt(quantity)) return setError('Quantity must be greater than 0.');
    if (!STATUSES.includes(status)) return setError('Status must be Pending, Confirmed, or Cancelled.');
    try {
      setSaving(true);
      await bookingApi.update(id, { quantity: Number(quantity), status });
      Alert.alert('Success', 'Booking updated');
      navigation.goBack();
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backText}>‹</Text></TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Booking</Text>
            <View style={styles.backPlaceholder} />
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.kicker}>Reservation Control</Text>
            <Text style={styles.title}>Update booking status</Text>
            <Text style={styles.subtitle}>Adjust ticket quantity and keep the reservation lifecycle accurate.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Booking Controls</Text>
            <ErrorMessage message={error} />
            <AppInput label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" placeholder="Number of tickets" />
            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.chipRow}>{STATUSES.map((s) => <StatusChip key={s} label={s} selected={status === s} onPress={() => setStatus(s)} />)}</View>
            <AppButton title={saving ? 'Saving...' : 'Save Changes'} onPress={onSave} disabled={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background }, keyboardView: { flex: 1 }, page: { padding: 18, paddingBottom: 34 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: UI.border }, backText: { color: UI.text, fontSize: 28, lineHeight: 28, fontWeight: '900' }, backPlaceholder: { width: 40, height: 40 }, headerTitle: { color: UI.text, fontWeight: '900', fontSize: 17 },
  heroCard: { backgroundColor: UI.primary, borderRadius: 28, padding: 22, marginBottom: 16, shadowColor: UI.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 8 },
  kicker: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }, title: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 7 }, subtitle: { color: 'rgba(255,255,255,0.86)', lineHeight: 21, fontWeight: '700', marginTop: 7 },
  formCard: { backgroundColor: '#fff', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: UI.border }, sectionTitle: { color: UI.text, fontSize: 18, fontWeight: '900', marginBottom: 12 },
  fieldLabel: { color: UI.text, fontWeight: '900', marginTop: 10, marginBottom: 10 }, chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }, chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: UI.border, backgroundColor: '#FFF8FC' }, chipActive: { backgroundColor: UI.primary, borderColor: UI.primary }, chipText: { color: UI.text, fontWeight: '800', fontSize: 12 }, chipTextActive: { color: '#fff' },
});
