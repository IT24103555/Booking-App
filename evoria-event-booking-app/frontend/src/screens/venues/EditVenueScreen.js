import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { venueApi } from '../../api/venueApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors } from '../../constants/colors';
import { isPositiveInt, isRequired } from '../../utils/validators';

const STATUS_OPTIONS = ['Available', 'Unavailable'];

function OptionChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.optionChip, selected ? styles.optionChipSelected : null]}
    >
      <Text style={[styles.optionText, selected ? styles.optionTextSelected : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function EditVenueScreen({ route, navigation }) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('Available');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await venueApi.getById(id);
        const v = res.data;
        setName(v?.name || '');
        setLocation(v?.location || '');
        setCapacity(String(v?.capacity ?? 1));
        setDescription(v?.description || '');
        setImageUrl(v?.image || '');
        setStatus(v?.status || 'Available');
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
    if (!isRequired(name)) return setError('Name is required');
    if (!isRequired(location)) return setError('Location is required');
    if (!isPositiveInt(capacity)) return setError('Capacity must be > 0');
    if (!STATUS_OPTIONS.includes(status)) return setError('Status must be Available or Unavailable');

    try {
      setSaving(true);
      await venueApi.update(id, {
        name: name.trim(),
        location: location.trim(),
        capacity: Number(capacity),
        description: description.trim(),
        image: imageUrl.trim() || undefined,
        status,
      });
      Alert.alert('Success', 'Venue updated');
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Venue management</Text>
          <Text style={styles.title}>Edit Venue</Text>
          <Text style={styles.subtitle}>Refine venue information and keep availability accurate for event planning.</Text>
        </View>

        <View style={styles.card}>
          <ErrorMessage message={error} />

          <View style={styles.previewCard}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Text style={styles.previewIcon}>🏛️</Text>
                <Text style={styles.previewText}>Venue image preview</Text>
              </View>
            )}
          </View>

          <AppInput label="Name" value={name} onChangeText={setName} placeholder="Venue name" />
          <AppInput label="Location" value={location} onChangeText={setLocation} placeholder="Venue location" />
          <AppInput label="Capacity" value={capacity} onChangeText={setCapacity} placeholder="200" keyboardType="numeric" />
          <AppInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional" />
          <AppInput label="Image URL (optional)" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

          <View style={styles.optionSection}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.optionRow}>
              {STATUS_OPTIONS.map((option) => (
                <OptionChip
                  key={option}
                  label={option}
                  selected={status === option}
                  onPress={() => setStatus(option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton title={saving ? 'Saving...' : 'Save Changes'} onPress={onSave} disabled={saving} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: colors.background },
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  header: {
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 16,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -0.4 },
  subtitle: { marginTop: 10, color: colors.muted, fontSize: 15, lineHeight: 22 },
  card: {
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
  },
  previewCard: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  previewImage: { width: '100%', height: 180 },
  previewPlaceholder: { height: 180, alignItems: 'center', justifyContent: 'center', padding: 20 },
  previewIcon: { fontSize: 34, marginBottom: 10 },
  previewText: { color: colors.muted, fontWeight: '800' },
  optionSection: { marginTop: 8 },
  label: { color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: 10 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { color: colors.muted, fontWeight: '800', fontSize: 13 },
  optionTextSelected: { color: '#FFFFFF' },
  actions: { marginTop: 16 },
});
