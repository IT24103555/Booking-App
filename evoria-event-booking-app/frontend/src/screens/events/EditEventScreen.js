import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { eventApi } from '../../api/eventApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors } from '../../constants/colors';
import { isRequired, isTimeHHmm } from '../../utils/validators';

const STATUS_OPTIONS = ['Draft', 'Published', 'Cancelled', 'Completed'];

function OptionChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.optionChip, selected && styles.optionChipSelected]}>
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function EditEventScreen({ route, navigation }) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [venueId, setVenueId] = useState('');
  const [status, setStatus] = useState('Draft');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await eventApi.getById(id);
        const e = res.data;
        setTitle(e?.title || '');
        setDescription(e?.description || '');
        setEventDate(e?.eventDate ? String(e.eventDate).slice(0, 10) : '');
        setStartTime(e?.startTime || '10:00');
        setEndTime(e?.endTime || '12:00');
        setVenueId(e?.venue?._id || e?.venueId?._id || e?.venue || e?.venueId || '');
        setStatus(e?.status || 'Draft');
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSave = async () => {
    setError('');
    if (!isRequired(title)) return setError('Title is required.');
    if (!isRequired(eventDate)) return setError('Event date is required (YYYY-MM-DD).');
    const d = new Date(eventDate);
    if (Number.isNaN(d.getTime())) return setError('Event date must be valid (YYYY-MM-DD).');
    if (!isTimeHHmm(startTime) || !isTimeHHmm(endTime)) return setError('Time must be HH:mm.');
    if (endTime <= startTime) return setError('End time must be after start time.');
    if (!isRequired(venueId)) return setError('Venue ID is required.');
    if (!STATUS_OPTIONS.includes(status)) return setError('Status must be Draft, Published, Cancelled, or Completed.');

    try {
      setSaving(true);
      await eventApi.update(id, {
        title: title.trim(),
        description,
        eventDate,
        startTime,
        endTime,
        venueId: venueId.trim(),
        status,
      });
      Alert.alert('Success', 'Event updated');
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}><Text style={styles.heroIconText}>🎫</Text></View>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>Event control</Text>
            <Text style={styles.title}>Update event details</Text>
            <Text style={styles.subtitle}>Edit schedule, venue reference, and publishing status with a clean admin workflow.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Event information</Text>
          <Text style={styles.sectionHint}>Changes will be shown to customers once the event is published.</Text>
          <ErrorMessage message={error} />

          <AppInput label="Event title" value={title} onChangeText={setTitle} placeholder="Event title" />
          <AppInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional event description" />
          <View style={styles.twoColumn}>
            <View style={styles.column}><AppInput label="Event date" value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" /></View>
            <View style={styles.column}><AppInput label="Venue ID" value={venueId} onChangeText={setVenueId} placeholder="MongoDB ObjectId" /></View>
          </View>
          <View style={styles.twoColumn}>
            <View style={styles.column}><AppInput label="Start time" value={startTime} onChangeText={setStartTime} placeholder="10:00" /></View>
            <View style={styles.column}><AppInput label="End time" value={endTime} onChangeText={setEndTime} placeholder="12:00" /></View>
          </View>

          <View style={styles.optionSection}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.optionRow}>
              {STATUS_OPTIONS.map((option) => (
                <OptionChip key={option} label={option} selected={status === option} onPress={() => setStatus(option)} />
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton title={saving ? 'Saving...' : 'Save event'} onPress={onSave} disabled={saving} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: '#FFF7FB' },
  page: { flexGrow: 1, padding: 20, paddingBottom: 34, backgroundColor: '#FFF7FB' },
  heroCard: {
    borderRadius: 32,
    padding: 22,
    marginBottom: 18,
    backgroundColor: '#F80678',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#F80678',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 8,
  },
  heroIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  heroIconText: { fontSize: 28 },
  heroCopy: { flex: 1 },
  kicker: { color: '#FFE4F1', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', lineHeight: 32, marginTop: 6 },
  subtitle: { color: '#FFEAF4', fontSize: 14, lineHeight: 21, marginTop: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FCE1EE',
    shadowColor: '#2D0A35',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 5,
  },
  sectionTitle: { color: '#1F1D2B', fontSize: 20, fontWeight: '900' },
  sectionHint: { color: '#7A7185', fontSize: 13, lineHeight: 19, marginTop: 4, marginBottom: 12 },
  twoColumn: { flexDirection: 'row', marginHorizontal: -5 },
  column: { flex: 1, marginHorizontal: 5 },
  optionSection: { marginTop: 12, marginBottom: 8 },
  label: { color: '#1F1D2B', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap' },
  optionChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: '#FFF2F8', borderWidth: 1, borderColor: '#F7C9DC', marginRight: 8, marginBottom: 8 },
  optionChipSelected: { backgroundColor: '#F80678', borderColor: '#F80678' },
  optionText: { color: '#9A315F', fontSize: 13, fontWeight: '800' },
  optionTextSelected: { color: '#FFFFFF' },
  actions: { marginTop: 16 },
});
