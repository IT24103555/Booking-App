import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View, Text, StyleSheet } from 'react-native';
import { sessionAgendaApi } from '../../api/sessionAgendaApi';
import { getErrorMessage } from '../../api/apiClient';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { confirmDialog } from '../../components/ConfirmDialog';

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );
}

function StatusPill({ status }) {
  const map = {
    Scheduled: ['#EDE9FE', '#5B21B6'],
    Completed: ['#DCFCE7', '#047857'],
    Cancelled: ['#FEE2E2', '#B91C1C'],
  };
  const [bg, fg] = map[status] || ['#F3F4F6', '#4B5563'];
  return <View style={[styles.statusPill, { backgroundColor: bg }]}><Text style={[styles.statusText, { color: fg }]}>{status || 'Unknown'}</Text></View>;
}

export default function SessionAgendaDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await sessionAgendaApi.getById(id);
      setItem(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const onDelete = () => {
    confirmDialog({
      title: 'Delete session?',
      message: 'Are you sure you want to delete this session?',
      onConfirm: async () => {
        try {
          await sessionAgendaApi.remove(id);
          Alert.alert('Success', 'Session deleted');
          navigation.goBack();
        } catch (e) {
          Alert.alert('Error', getErrorMessage(e));
        }
      },
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <ErrorMessage message={error} />
      {item ? (
        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.timelineMarker}>
              <Text style={styles.timelineStart}>{item.startTime || '--:--'}</Text>
              <View style={styles.timelineLine} />
              <Text style={styles.timelineEnd}>{item.endTime || '--:--'}</Text>
            </View>
            <View style={styles.heroCopy}>
              <View style={styles.heroTop}><Text style={styles.kicker}>Session agenda</Text><StatusPill status={item.status} /></View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.event?.title || item.event || 'Event not assigned'}</Text>
            </View>
          </View>

          <AppCard>
            <Text style={styles.sectionTitle}>Session information</Text>
            <DetailRow label="Speaker" value={item.speaker || 'To be announced'} />
            <DetailRow label="Time" value={`${item.startTime || '-'} - ${item.endTime || '-'}`} />
            <DetailRow label="Status" value={item.status} />
            <DetailRow label="Description" value={item.description || 'No description provided.'} />
          </AppCard>

          <View style={styles.actions}>
            <AppButton title="Edit session" onPress={() => navigation.navigate('EditSessionAgenda', { id })} />
            <AppButton title="Delete session" variant="danger" onPress={onDelete} />
          </View>
        </View>
      ) : (
        <EmptyState title="Session not found" actionTitle="Reload" onAction={load} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 20, backgroundColor: '#FFF7FB', paddingBottom: 34 },
  content: { width: '100%', alignSelf: 'center' },
  heroCard: { backgroundColor: '#6C5CE7', borderRadius: 32, padding: 22, flexDirection: 'row', marginBottom: 18, shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 8 },
  timelineMarker: { width: 72, alignItems: 'center', marginRight: 16 },
  timelineStart: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  timelineLine: { width: 4, height: 42, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)', marginVertical: 8 },
  timelineEnd: { color: '#EDE9FE', fontWeight: '800', fontSize: 13 },
  heroCopy: { flex: 1 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { color: '#EDE9FE', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 10, lineHeight: 34 },
  subtitle: { color: '#F4F1FF', fontSize: 14, lineHeight: 21, marginTop: 8 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '900' },
  sectionTitle: { color: '#1F1D2B', fontSize: 18, fontWeight: '900', marginBottom: 12 },
  detailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1EAF3' },
  detailLabel: { color: '#8B7E93', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  detailValue: { color: '#1F1D2B', fontSize: 15, fontWeight: '700', marginTop: 4, lineHeight: 21 },
  actions: { marginTop: 18 },
});
