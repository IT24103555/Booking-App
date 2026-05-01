import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { eventApi } from '../../api/eventApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { colors } from '../../constants/colors';
import { isRequired, isTimeHHmm } from '../../utils/validators';

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
      input.type = 'file';
      input.accept = 'image/*';
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
    if (!['Draft', 'Published', 'Cancelled', 'Completed'].includes(status)) {
      return setError('Status must be Draft, Published, Cancelled, or Completed.');
    }

    try {
      setSaving(true);
      const payload = { title: title.trim(), description, eventDate, startTime, endTime, venueId: venueId.trim(), status };
      if (imageFile) payload.imageFile = imageFile;
      await eventApi.create(payload);
      Alert.alert('Success', 'Event created');
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
            <Text style={styles.kicker}>New event</Text>
            <Text style={styles.title}>Create a polished event listing</Text>
            <Text style={styles.subtitle}>Add schedule, venue reference, and publishing status for your event.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Event information</Text>
            <ErrorMessage message={error} />
            <AppInput label="Event title" value={title} onChangeText={setTitle} placeholder="Event title" />
            <AppInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional event description" />
            
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Event image</Text>
              {imagePreview ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                  <TouchableOpacity onPress={onPickImage} style={styles.changeImageBtn}>
                    <Text style={styles.changeImageText}>Change image</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={onPickImage} style={styles.uploadImageBtn}>
                  <Text style={styles.uploadImageText}>📸 Upload event image</Text>
                  <Text style={styles.uploadImageSubtext}>Attracts customers and increases bookings</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.fieldColumn}><AppInput label="Event Date" value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" /></View>
              <View style={styles.fieldColumn}><AppInput label="Status" value={status} onChangeText={setStatus} placeholder="Draft" /></View>
            </View>
            <View style={styles.twoColumn}>
              <View style={styles.fieldColumn}><AppInput label="Start Time" value={startTime} onChangeText={setStartTime} placeholder="10:00" /></View>
              <View style={styles.fieldColumn}><AppInput label="End Time" value={endTime} onChangeText={setEndTime} placeholder="12:00" /></View>
            </View>
            <AppInput label="Venue ID" value={venueId} onChangeText={setVenueId} placeholder="Select venue / MongoDB ObjectId" />
            <Text style={styles.helperText}>Senior UX note: replace this ID field with a venue selector when venue lookup API is connected.</Text>
            <AppButton title={saving ? 'Saving...' : 'Create event'} onPress={onSave} disabled={saving} />
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
  imageSection: { backgroundColor: colors.background, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  uploadImageBtn: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center' },
  uploadImageText: { color: colors.primary, fontWeight: '900', fontSize: 16, marginBottom: 6 },
  uploadImageSubtext: { color: colors.muted, fontSize: 12 },
  imagePreviewContainer: { alignItems: 'center' },
  imagePreview: { width: '100%', height: 220, borderRadius: 16, marginBottom: 12 },
  changeImageBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  changeImageText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  twoColumn: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  fieldColumn: { flex: 1, minWidth: 220 },
  helperText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: -4, marginBottom: 12 },
});
