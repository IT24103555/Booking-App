import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { eventApi } from '../../api/eventApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { isRequired, isTimeHHmm } from '../../utils/validators';

const UI = { primary: '#EC168C', background: '#FFF7FC', surface: '#FFFFFF', text: '#111827', muted: '#7C7C8A', border: '#F0DDEB', softPink: '#FFE7F4' };
const STATUSES = ['Draft', 'Published', 'Cancelled', 'Completed'];
function Chip({ label, selected, onPress }) { return <TouchableOpacity style={[styles.chip, selected && styles.chipActive]} onPress={onPress}><Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text></TouchableOpacity>; }

export default function AddEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [venueId, setVenueId] = useState('');
  const [status, setStatus] = useState('Draft');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onPickImage = async () => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onload = (evt) => setImagePreview(evt.target.result);
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const onSave = async () => {
    setError('');
    if (!isRequired(title)) return setError('Title is required.');
    if (!isRequired(eventDate)) return setError('Event date is required (YYYY-MM-DD).');
    const d = new Date(eventDate);
    if (Number.isNaN(d.getTime())) return setError('Event date must be valid (YYYY-MM-DD).');
    if (!isTimeHHmm(startTime) || !isTimeHHmm(endTime)) return setError('Time must be HH:mm.');
    if (endTime <= startTime) return setError('End time must be after start time.');
    if (!isRequired(venueId)) return setError('Venue ID is required.');
    if (!STATUSES.includes(status)) return setError('Status must be Draft, Published, Cancelled, or Completed.');
    try {
      setSaving(true);
      const payload = { title: title.trim(), description, eventDate, startTime, endTime, venueId: venueId.trim(), status };
      if (imageFile) payload.imageFile = imageFile;
      await eventApi.create(payload);
      Alert.alert('Success', 'Event created');
      navigation.goBack();
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}><TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backText}>‹</Text></TouchableOpacity><Text style={styles.headerTitle}>Add Event</Text><View style={styles.backPlaceholder} /></View>
          <View style={styles.heroCard}><Text style={styles.kicker}>New Event</Text><Text style={styles.title}>Create a polished listing</Text><Text style={styles.subtitle}>Add schedule, venue reference, image, and publishing status.</Text></View>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Event Information</Text><ErrorMessage message={error} />
            <TouchableOpacity style={styles.imagePicker} onPress={onPickImage}>{imagePreview ? <Image source={{ uri: imagePreview }} style={styles.previewImage} /> : <><Text style={styles.imageIcon}>🖼️</Text><Text style={styles.imageText}>Upload Event Image</Text></>}</TouchableOpacity>
            <AppInput label="Event Title" value={title} onChangeText={setTitle} placeholder="Sunset Music Festival 2025" />
            <AppInput label="Description" value={description} onChangeText={setDescription} placeholder="Describe event details" multiline />
            <AppInput label="Event Date" value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" />
            <View style={styles.rowFields}><View style={styles.flexField}><AppInput label="Start" value={startTime} onChangeText={setStartTime} placeholder="10:00" /></View><View style={styles.flexField}><AppInput label="End" value={endTime} onChangeText={setEndTime} placeholder="12:00" /></View></View>
            <AppInput label="Venue ID" value={venueId} onChangeText={setVenueId} placeholder="MongoDB venue id" />
            <Text style={styles.fieldLabel}>Status</Text><View style={styles.chipRow}>{STATUSES.map((s) => <Chip key={s} label={s} selected={status === s} onPress={() => setStatus(s)} />)}</View>
            <AppButton title={saving ? 'Creating...' : 'Create Event'} onPress={onSave} disabled={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background }, keyboardView: { flex: 1 }, page: { padding: 18, paddingBottom: 34 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: UI.border }, backText: { color: UI.text, fontSize: 28, lineHeight: 28, fontWeight: '900' }, backPlaceholder: { width: 40, height: 40 }, headerTitle: { color: UI.text, fontWeight: '900', fontSize: 17 },
  heroCard: { backgroundColor: UI.primary, borderRadius: 28, padding: 22, marginBottom: 16, shadowColor: UI.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 8 }, kicker: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }, title: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 7 }, subtitle: { color: 'rgba(255,255,255,0.86)', lineHeight: 21, fontWeight: '700', marginTop: 7 },
  formCard: { backgroundColor: '#fff', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: UI.border }, sectionTitle: { color: UI.text, fontSize: 18, fontWeight: '900', marginBottom: 12 },
  imagePicker: { height: 150, borderRadius: 22, backgroundColor: '#FFF3FA', borderWidth: 1.5, borderStyle: 'dashed', borderColor: UI.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 14, overflow: 'hidden' }, previewImage: { width: '100%', height: '100%' }, imageIcon: { fontSize: 32 }, imageText: { color: UI.primary, fontWeight: '900', marginTop: 8 },
  rowFields: { flexDirection: 'row', gap: 10 }, flexField: { flex: 1 }, fieldLabel: { color: UI.text, fontWeight: '900', marginTop: 8, marginBottom: 10 }, chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }, chip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: UI.border, backgroundColor: '#FFF8FC' }, chipActive: { backgroundColor: UI.primary, borderColor: UI.primary }, chipText: { color: UI.text, fontWeight: '800', fontSize: 12 }, chipTextActive: { color: '#fff' },
});
