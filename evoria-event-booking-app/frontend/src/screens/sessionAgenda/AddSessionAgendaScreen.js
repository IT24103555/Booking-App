import React, { useState } from 'react';
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
import { sessionAgendaApi } from '../../api/sessionAgendaApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { isRequired, isTimeHHmm } from '../../utils/validators';

const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled'];

function StatusChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.statusChip, selected && styles.statusChipSelected]}>
      <Text style={[styles.statusChipText, selected && styles.statusChipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function AddSessionAgendaScreen({ navigation }) {
  const [eventId, setEventId] = useState('');
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Scheduled');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setError('');
    if (!isRequired(eventId)) return setError('Event is required.');
    if (!isRequired(title)) return setError('Title is required.');
    if (!isTimeHHmm(startTime) || !isTimeHHmm(endTime)) return setError('Time must be HH:mm.');
    if (endTime <= startTime) return setError('End time must be after start time.');
    if (!STATUS_OPTIONS.includes(status)) return setError('Status must be Scheduled, Completed, or Cancelled.');

    try {
      setSaving(true);
      await sessionAgendaApi.create({ event: eventId.trim(), title: title.trim(), speaker, startTime, endTime, description, status });
      Alert.alert('Success', 'Session created');
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeMain}>{startTime}</Text>
            <Text style={styles.timeBadgeSub}>{endTime}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>Agenda builder</Text>
            <Text style={styles.title}>Create event session</Text>
            <Text style={styles.subtitle}>Design a clear program timeline with speaker, time, and status.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Session information</Text>
          <Text style={styles.sectionHint}>Keep agenda items simple and easy for users to scan.</Text>
          <ErrorMessage message={error} />

          <AppInput label="Event ID" value={eventId} onChangeText={setEventId} placeholder="Select event / MongoDB ObjectId" />
          <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="Opening Talk" />
          <AppInput label="Speaker" value={speaker} onChangeText={setSpeaker} placeholder="Speaker name" />
          <View style={styles.twoColumn}>
            <View style={styles.column}><AppInput label="Start time" value={startTime} onChangeText={setStartTime} placeholder="10:00" /></View>
            <View style={styles.column}><AppInput label="End time" value={endTime} onChangeText={setEndTime} placeholder="10:30" /></View>
          </View>
          <AppInput label="Description" value={description} onChangeText={setDescription} placeholder="Short session description" />

          <View style={styles.statusSection}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((option) => (
                <StatusChip key={option} label={option} selected={status === option} onPress={() => setStatus(option)} />
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton title={saving ? 'Saving...' : 'Create session'} onPress={onSave} disabled={saving} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: '#FFF7FB' },
  page: { flexGrow: 1, padding: 20, paddingBottom: 34, backgroundColor: '#FFF7FB' },
  heroCard: { backgroundColor: '#6C5CE7', borderRadius: 32, padding: 22, flexDirection: 'row', alignItems: 'center', marginBottom: 18, shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 8 },
  timeBadge: { width: 76, height: 76, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  timeBadgeMain: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  timeBadgeSub: { color: '#EDE9FE', fontSize: 12, fontWeight: '700', marginTop: 2 },
  heroCopy: { flex: 1 },
  kicker: { color: '#EDE9FE', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 6 },
  subtitle: { color: '#F4F1FF', fontSize: 14, lineHeight: 21, marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, borderWidth: 1, borderColor: '#ECE7FF', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 22, elevation: 5 },
  sectionTitle: { color: '#1F1D2B', fontSize: 20, fontWeight: '900' },
  sectionHint: { color: '#7A7185', fontSize: 13, lineHeight: 19, marginTop: 4, marginBottom: 12 },
  twoColumn: { flexDirection: 'row', marginHorizontal: -5 },
  column: { flex: 1, marginHorizontal: 5 },
  statusSection: { marginTop: 12 },
  label: { color: '#1F1D2B', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap' },
  statusChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#DDD6FE', marginRight: 8, marginBottom: 8 },
  statusChipSelected: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  statusChipText: { color: '#5B21B6', fontSize: 13, fontWeight: '800' },
  statusChipTextSelected: { color: '#FFFFFF' },
  actions: { marginTop: 18 },
});
