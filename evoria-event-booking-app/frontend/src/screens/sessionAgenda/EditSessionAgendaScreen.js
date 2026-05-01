import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { sessionAgendaApi } from '../../api/sessionAgendaApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors } from '../../constants/colors';
import { isRequired, isTimeHHmm } from '../../utils/validators';

export default function EditSessionAgendaScreen({ route, navigation }) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [eventId, setEventId] = useState('');
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Scheduled');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await sessionAgendaApi.getById(id);
        const s = res.data;
        setEventId(s?.event?._id || s?.event || '');
        setTitle(s?.title || '');
        setSpeaker(s?.speaker || '');
        setStartTime(s?.startTime || '10:00');
        setEndTime(s?.endTime || '10:30');
        setDescription(s?.description || '');
        setStatus(s?.status || 'Scheduled');
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
    if (!isRequired(eventId)) return setError('Event is required.');
    if (!isRequired(title)) return setError('Title is required.');
    if (!isTimeHHmm(startTime) || !isTimeHHmm(endTime)) return setError('Time must be HH:mm.');
    if (endTime <= startTime) return setError('End time must be after start time.');
    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) return setError('Status must be Scheduled, Completed, or Cancelled.');

    try {
      setSaving(true);
      await sessionAgendaApi.update(id, { event: eventId.trim(), title: title.trim(), speaker, startTime, endTime, description, status });
      Alert.alert('Success', 'Session updated');
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
            <Text style={styles.kicker}>Edit session</Text>
            <Text style={styles.title}>Update agenda item</Text>
            <Text style={styles.subtitle}>Keep session timing, speaker, and status accurate.</Text>
          </View>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Session information</Text>
            <ErrorMessage message={error} />
            <AppInput label="Event ID" value={eventId} onChangeText={setEventId} placeholder="Select event / MongoDB ObjectId" />
            <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="Session title" />
            <AppInput label="Speaker" value={speaker} onChangeText={setSpeaker} placeholder="Optional speaker name" />
            <View style={styles.twoColumn}>
              <View style={styles.fieldColumn}><AppInput label="Start Time" value={startTime} onChangeText={setStartTime} placeholder="10:00" /></View>
              <View style={styles.fieldColumn}><AppInput label="End Time" value={endTime} onChangeText={setEndTime} placeholder="10:30" /></View>
            </View>
            <AppInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional session description" />
            <AppInput label="Status" value={status} onChangeText={setStatus} placeholder="Scheduled / Completed / Cancelled" />
            <Text style={styles.helperText}>Use one of: Scheduled, Completed, Cancelled.</Text>
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
  shell: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  headerCard: { backgroundColor: colors.card, borderRadius: 28, padding: 22, borderWidth: 1, borderColor: colors.border, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 3 },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { marginTop: 7, color: colors.text, fontSize: 29, fontWeight: '900', lineHeight: 35, letterSpacing: -0.5 },
  subtitle: { color: colors.muted, marginTop: 8, lineHeight: 22 },
  formCard: { backgroundColor: colors.card, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '900', marginBottom: 12 },
  twoColumn: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  fieldColumn: { flex: 1, minWidth: 220 },
  helperText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: -4, marginBottom: 12 },
});
