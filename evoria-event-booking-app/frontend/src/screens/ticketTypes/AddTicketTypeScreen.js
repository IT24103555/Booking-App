import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { ticketTypeApi } from '../../api/ticketTypeApi';
import { eventApi } from '../../api/eventApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { isNonNegativeNumber, isPositiveInt, isRequired } from '../../utils/validators';

const STATUS_OPTIONS = ['Active', 'Inactive'];

function OptionChip({ label, selected, onPress }) {
  return <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.optionChip, selected && styles.optionChipSelected]}><Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text></TouchableOpacity>;
}

export default function AddTicketTypeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [eventId, setEventId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [availableQuantity, setAvailableQuantity] = useState('1');
  const [status, setStatus] = useState('Active');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await eventApi.getAll();
        setEvents(res.data || []);
      } catch (e) { setEvents([]); }
    };
    load();
  }, []);

  const onSave = async () => {
    setError('');
    if (!isRequired(eventId)) return setError('Event is required.');
    if (!isRequired(name)) return setError('Name is required.');
    if (!isNonNegativeNumber(price)) return setError('Price must be greater than or equal to 0.');
    if (!isPositiveInt(totalQuantity)) return setError('Total quantity must be greater than 0.');
    if (!isPositiveInt(availableQuantity)) return setError('Available quantity must be greater than 0.');
    if (Number(availableQuantity) > Number(totalQuantity)) return setError('Available quantity cannot be greater than total quantity.');
    if (!STATUS_OPTIONS.includes(status)) return setError('Status must be Active or Inactive.');

    try {
      setSaving(true);
      await ticketTypeApi.create({ eventId: eventId.trim(), name: name.trim(), description, price: Number(price), totalQuantity: Number(totalQuantity), availableQuantity: Number(availableQuantity), status });
      Alert.alert('Success', 'Ticket type created');
      navigation.goBack();
    } catch (e) { setError(getErrorMessage(e)); } finally { setSaving(false); }
  };

  const selectedEvent = events.find((e) => e._id === eventId);
  const capacityPercent = Math.min(100, Math.round((Number(availableQuantity || 0) / Math.max(Number(totalQuantity || 1), 1)) * 100));

  return (
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Ticket setup</Text>
          <Text style={styles.title}>Create ticket type</Text>
          <Text style={styles.subtitle}>Define price, capacity, and availability for smooth event reservations.</Text>
          <View style={styles.previewTicket}>
            <View><Text style={styles.previewName}>{name || 'Student Pass'}</Text><Text style={styles.previewMeta}>{selectedEvent?.title || 'Select event'}</Text></View>
            <Text style={styles.previewPrice}>${Number(price || 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ticket information</Text>
          <ErrorMessage message={error} />

          <View style={styles.selectorCard}>
            <Text style={styles.selectorLabel}>Event</Text>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setShowEvents((s) => !s)} style={styles.selectorBox}>
              <Text style={styles.selectorText}>{selectedEvent?.title || 'Select event'}</Text>
              <Text style={styles.selectorChevron}>⌄</Text>
            </TouchableOpacity>
            {showEvents && (
              <View style={styles.listBox}>
                {events.map((event) => (
                  <TouchableOpacity key={event._id} style={styles.listItem} onPress={() => { setEventId(event._id); setShowEvents(false); }}>
                    <Text style={styles.listItemTitle}>{event.title}</Text>
                    <Text style={styles.listItemMeta}>{event.venueId?.name || 'Venue TBA'}{event.eventDate ? ` · ${String(event.eventDate).slice(0, 10)}` : ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <AppInput label="Ticket name" value={name} onChangeText={setName} placeholder="Student Pass" />
          <AppInput label="Description" value={description} onChangeText={setDescription} placeholder="Short ticket description" />
          <View style={styles.twoColumn}>
            <View style={styles.column}><AppInput label="Price" value={price} onChangeText={setPrice} placeholder="0" keyboardType="numeric" /></View>
            <View style={styles.column}><AppInput label="Total quantity" value={totalQuantity} onChangeText={setTotalQuantity} placeholder="100" keyboardType="numeric" /></View>
          </View>
          <AppInput label="Available quantity" value={availableQuantity} onChangeText={setAvailableQuantity} placeholder="100" keyboardType="numeric" />

          <View style={styles.progressHeader}><Text style={styles.progressLabel}>Availability preview</Text><Text style={styles.progressValue}>{capacityPercent}%</Text></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${capacityPercent}%` }]} /></View>

          <View style={styles.optionSection}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.optionRow}>{STATUS_OPTIONS.map((option) => <OptionChip key={option} label={option} selected={status === option} onPress={() => setStatus(option)} />)}</View>
          </View>

          <View style={styles.actions}><AppButton title={saving ? 'Saving...' : 'Create ticket type'} onPress={onSave} disabled={saving} /></View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: '#FFF7FB' },
  page: { flexGrow: 1, padding: 20, backgroundColor: '#FFF7FB', paddingBottom: 34 },
  heroCard: { backgroundColor: '#F80678', borderRadius: 32, padding: 22, marginBottom: 18, shadowColor: '#F80678', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 8 },
  kicker: { color: '#FFE4F1', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', marginTop: 6 },
  subtitle: { color: '#FFEAF4', fontSize: 14, lineHeight: 21, marginTop: 8 },
  previewTicket: { marginTop: 18, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 22, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewName: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  previewMeta: { color: '#FFEAF4', fontSize: 12, fontWeight: '700', marginTop: 3 },
  previewPrice: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, borderWidth: 1, borderColor: '#FCE1EE', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 22, elevation: 5 },
  sectionTitle: { color: '#1F1D2B', fontSize: 20, fontWeight: '900', marginBottom: 12 },
  selectorCard: { marginBottom: 14 },
  selectorLabel: { color: '#1F1D2B', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  selectorBox: { height: 54, borderRadius: 18, backgroundColor: '#FFF7FB', borderWidth: 1, borderColor: '#F7C9DC', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorText: { color: '#1F1D2B', fontSize: 14, fontWeight: '700', flex: 1 },
  selectorChevron: { color: '#F80678', fontSize: 18, fontWeight: '900' },
  listBox: { marginTop: 8, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#FCE1EE', overflow: 'hidden' },
  listItem: { padding: 13, borderBottomWidth: 1, borderBottomColor: '#FCE1EE' },
  listItemTitle: { color: '#1F1D2B', fontSize: 14, fontWeight: '800' },
  listItemMeta: { color: '#8B7E93', fontSize: 12, marginTop: 3 },
  twoColumn: { flexDirection: 'row', marginHorizontal: -5 },
  column: { flex: 1, marginHorizontal: 5 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  progressLabel: { color: '#8B7E93', fontSize: 12, fontWeight: '800' },
  progressValue: { color: '#F80678', fontSize: 12, fontWeight: '900' },
  progressTrack: { height: 9, borderRadius: 10, backgroundColor: '#FFE4F1', marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10, backgroundColor: '#F80678' },
  optionSection: { marginTop: 16 },
  label: { color: '#1F1D2B', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  optionRow: { flexDirection: 'row' },
  optionChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 16, backgroundColor: '#FFF2F8', borderWidth: 1, borderColor: '#F7C9DC', marginRight: 8 },
  optionChipSelected: { backgroundColor: '#F80678', borderColor: '#F80678' },
  optionText: { color: '#9A315F', fontSize: 13, fontWeight: '800' },
  optionTextSelected: { color: '#FFFFFF' },
  actions: { marginTop: 18 },
});
