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
  Image,
  SafeAreaView,
  FlatList,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../config/apiConfig';
import { eventApi } from '../../api/eventApi';
import { venueApi } from '../../api/venueApi';
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
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [status, setStatus] = useState('Draft');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
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
        const vid = e?.venue?._id || e?.venueId?._id || e?.venue || e?.venueId || '';
        setVenueId(vid);
        // Try to find and set the selected venue
        if (venues.length > 0 && vid) {
          const venue = venues.find(v => v._id === vid);
          if (venue) setSelectedVenue(venue);
        }
        setStatus(e?.status || 'Draft');
        // Prepare image preview if event has image path
        if (e?.image) {
          const base = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';
          setImagePreview(String(e.image).startsWith('http') ? e.image : `${base}${e.image}`);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, venues]);

  const onPickImage = async () => {
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

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access photos is required to upload images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
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
      Alert.alert('Image error', 'Could not open image picker.');
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
    if (!venueId) return setError('Please select a venue.');
    if (!STATUS_OPTIONS.includes(status)) return setError('Status must be Draft, Published, Cancelled, or Completed.');

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description,
        eventDate,
        startTime,
        endTime,
        venueId,
        status,
      };
      if (imageFile) payload.imageFile = imageFile;
      await eventApi.update(id, payload);
      Alert.alert('Success', 'Event updated');
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSelectVenue = (venue) => {
    setVenueId(venue._id);
    setSelectedVenue(venue);
    setShowVenuePicker(false);
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

          <TouchableOpacity style={styles.imagePicker} onPress={onPickImage}>
            {imagePreview ? <Image source={{ uri: imagePreview }} style={styles.previewImage} /> : <><Text style={styles.imageIcon}>🖼️</Text><Text style={styles.imageText}>Upload Event Image</Text></>}
          </TouchableOpacity>

          <AppInput label="Event title" value={title} onChangeText={setTitle} placeholder="Event title" />
          <AppInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional event description" />
          <View style={styles.twoColumn}>
            <View style={styles.column}><AppInput label="Event date" value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" /></View>
            <View style={styles.column}>
              <Text style={styles.label}>Venue</Text>
              <TouchableOpacity style={styles.venueButton} onPress={() => setShowVenuePicker(true)}>
                <Text style={styles.venueButtonText}>{selectedVenue ? selectedVenue.name : loadingVenues ? 'Loading...' : 'Select venue'}</Text>
                <Text style={styles.venueButtonArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

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
  imagePicker: { height: 150, borderRadius: 22, backgroundColor: '#FFF3FA', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#F80678', alignItems: 'center', justifyContent: 'center', marginBottom: 14, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  imageIcon: { fontSize: 32 },
  imageText: { color: '#F80678', fontWeight: '900', marginTop: 8 },
  venueButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E6D4E0', backgroundColor: '#FFFFFF', marginTop: 4 },
  venueButtonText: { flex: 1, color: '#1F1D2B', fontWeight: '700', fontSize: 14 },
  venueButtonArrow: { color: '#F80678', fontSize: 16, fontWeight: '900' },
  modal: { flex: 1, backgroundColor: '#FFF7FB' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E6D4E0', backgroundColor: '#FFFFFF' },
  modalClose: { fontSize: 22, color: '#1F1D2B', fontWeight: '900', width: 30, textAlign: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '900', color: '#1F1D2B' },
  venueOption: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E6D4E0', backgroundColor: '#FFFFFF', marginBottom: 8, marginHorizontal: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  venueOptionSelected: { backgroundColor: '#FFF2F8', borderWidth: 1.5, borderColor: '#F80678' },
  venueOptionName: { fontSize: 15, fontWeight: '900', color: '#1F1D2B' },
  venueOptionLocation: { fontSize: 12, color: '#7A7185', marginTop: 3 },
  venueOptionCapacity: { fontSize: 11, color: '#7A7185', marginTop: 3 },
  checkmark: { fontSize: 18, color: '#F80678', fontWeight: '900' },
});
