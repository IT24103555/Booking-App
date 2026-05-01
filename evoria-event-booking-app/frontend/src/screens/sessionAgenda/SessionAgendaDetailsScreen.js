import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView } from 'react-native';
import { sessionAgendaApi } from '../../api/sessionAgendaApi';
import { getErrorMessage } from '../../api/apiClient';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { confirmDialog } from '../../components/ConfirmDialog';
import { colors } from '../../constants/colors';

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );
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

  useEffect(() => {
    load();
  }, [id]);

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
      <View style={styles.shell}>
        <ErrorMessage message={error} />
        {item ? (
          <>
            <View style={styles.hero}>
              <Text style={styles.kicker}>Session agenda</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.startTime} - {item.endTime} · {item.status}</Text>
            </View>
            <AppCard>
              <Text style={styles.sectionTitle}>Session information</Text>
              <DetailRow label="Event" value={item.event?.title || item.event} />
              <DetailRow label="Speaker" value={item.speaker || 'To be announced'} />
              <DetailRow label="Time" value={`${item.startTime || '-'} - ${item.endTime || '-'}`} />
              <DetailRow label="Status" value={item.status} />
              <DetailRow label="Description" value={item.description || 'No description provided.'} />
            </AppCard>
            <View style={styles.actionPanel}>
              <AppButton title="Edit session" onPress={() => navigation.navigate('EditSessionAgenda', { id })} />
              <AppButton title="Delete session" variant="danger" onPress={onDelete} />
            </View>
          </>
        ) : (
          <EmptyState title="Session not found" actionTitle="Reload" onAction={load} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  shell: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  hero: { backgroundColor: colors.primary, borderRadius: 30, padding: 24, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 14 }, elevation: 4 },
  kicker: { color: '#fff', opacity: 0.82, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 7, lineHeight: 36, letterSpacing: -0.4 },
  subtitle: { color: '#fff', opacity: 0.86, marginTop: 10, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 18, marginBottom: 12 },
  detailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.muted, fontWeight: '800', marginBottom: 5, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  detailValue: { color: colors.text, fontWeight: '700', lineHeight: 21 },
  actionPanel: { marginTop: 14, gap: 10 },
});
