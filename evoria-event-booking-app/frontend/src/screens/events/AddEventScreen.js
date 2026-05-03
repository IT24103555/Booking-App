import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, SafeAreaView, FlatList, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { eventApi } from '../../api/eventApi';
import { venueApi } from '../../api/venueApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { isRequired, validateEventSchedule } from '../../utils/validators';

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
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [status, setStatus] = useState('Draft');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [showVenuePicker, setShowVenuePicker] = useState(false);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await venueApi.getAll();
        setVenues(data.data || []);
      } catch (err) {
        console.error('Failed to load venues:', err);
      } finally {
        setLoadingVenues(false);
      }
    };
    loadVenues();
  }, []);

  const onPickImage = async () => {
    // Use browser file input on web so FormData receives a real File.
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (evt) => setImagePreview(evt.target.result);
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }

    // Use Expo ImagePicker for native devices.
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access photos is required to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      // Expo returns either { cancelled } (older) or { canceled }/assets (newer)
      if (result.cancelled || result.canceled) return;

      const asset = result.assets ? result.assets[0] : result;
      if (!asset) return;

      const uri = asset.uri;
      setImagePreview(uri);

      const fileName = uri.split('/').pop();
      const match = /\.([0-9a-z]+)(?:[?;]|$)/i.exec(fileName);
      const ext = match ? match[1] : 'jpg';
      const type = asset.type || `image/${ext}`;

      setImageFile({ uri, name: fileName, type });
    } catch (err) {
      // Fallback to web file input for web clients
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
      } else {
        Alert.alert('Image error', 'Could not open image picker.');
      }
    }
  };

  const onSave = async () => {
    setError('');
    if (!isRequired(title)) return setError('Title is required.');
    const scheduleCheck = validateEventSchedule(eventDate, startTime, endTime);
    if (!scheduleCheck.valid) return setError(scheduleCheck.message);
    if (!venueId) return setError('Please select a venue.');
    if (!STATUSES.includes(status)) return setError('Status must be Draft, Published, Cancelled, or Completed.');
    try {
      setSaving(true);
      const payload = { title: title.trim(), description, eventDate, startTime, endTime, venueId, status };
      if (imageFile) payload.imageFile = imageFile;
      await eventApi.create(payload);
      Alert.alert('Success', 'Event created');
      navigation.goBack();
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const handleSelectVenue = (venue) => {
    setVenueId(venue._id);
    setSelectedVenue(venue);
    setShowVenuePicker(false);
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
            <Text style={styles.helperText}>Use a real calendar date in YYYY-MM-DD format.</Text>
            <View style={styles.rowFields}><View style={styles.flexField}><AppInput label="Start" value={startTime} onChangeText={setStartTime} placeholder="HH:mm" /></View><View style={styles.flexField}><AppInput label="End" value={endTime} onChangeText={setEndTime} placeholder="HH:mm" /></View></View>
            <Text style={styles.helperText}>Use 24-hour time format, for example 09:00 or 18:30.</Text>
            
            <Text style={styles.fieldLabel}>Venue</Text>
            <TouchableOpacity style={styles.venueButton} onPress={() => setShowVenuePicker(true)}>
              <Text style={styles.venueButtonText}>{selectedVenue ? selectedVenue.name : loadingVenues ? 'Loading venues...' : 'Select a venue'}</Text>
              <Text style={styles.venueButtonArrow}>›</Text>
            </TouchableOpacity>
            
            <Modal visible={showVenuePicker} transparent animationType="slide">
              <SafeAreaView style={styles.modal}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowVenuePicker(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select Venue</Text>
                  <View style={styles.modalClose} />
                </View>
                <FlatList
                  data={venues}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.venueOption, venueId === item._id && styles.venueOptionSelected]}
                      onPress={() => handleSelectVenue(item)}
                    >
                      <View>
                        <Text style={styles.venueOptionName}>{item.name}</Text>
                        <Text style={styles.venueOptionLocation}>{item.location}</Text>
                        <Text style={styles.venueOptionCapacity}>Capacity: {item.capacity}</Text>
                      </View>
                      {venueId === item._id && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  )}
                />
              </SafeAreaView>
            </Modal>
            
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
  helperText: { color: UI.muted, fontSize: 12, lineHeight: 17, marginTop: -6, marginBottom: 10 },
  rowFields: { flexDirection: 'row', gap: 10 }, flexField: { flex: 1 }, fieldLabel: { color: UI.text, fontWeight: '900', marginTop: 8, marginBottom: 10 }, chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }, chip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: UI.border, backgroundColor: '#FFF8FC' }, chipActive: { backgroundColor: UI.primary, borderColor: UI.primary }, chipText: { color: UI.text, fontWeight: '800', fontSize: 12 }, chipTextActive: { color: '#fff' },
  venueButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: UI.border, backgroundColor: UI.surface, marginBottom: 18 }, venueButtonText: { flex: 1, color: UI.text, fontWeight: '700', fontSize: 15 }, venueButtonArrow: { color: UI.primary, fontSize: 18, fontWeight: '900' },
  modal: { flex: 1, backgroundColor: UI.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: UI.border, backgroundColor: UI.surface },
  modalClose: { fontSize: 24, color: UI.text, fontWeight: '900', width: 30, textAlign: 'center' },
  modalTitle: { fontSize: 17, fontWeight: '900', color: UI.text },
  venueOption: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: UI.border, backgroundColor: UI.surface, marginBottom: 8, marginHorizontal: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  venueOptionSelected: { backgroundColor: '#FFF3FA', borderWidth: 1.5, borderColor: UI.primary },
  venueOptionName: { fontSize: 16, fontWeight: '900', color: UI.text },
  venueOptionLocation: { fontSize: 13, color: UI.muted, marginTop: 4 },
  venueOptionCapacity: { fontSize: 12, color: UI.muted, marginTop: 4 },
  checkmark: { fontSize: 20, color: UI.primary, fontWeight: '900' },
});
