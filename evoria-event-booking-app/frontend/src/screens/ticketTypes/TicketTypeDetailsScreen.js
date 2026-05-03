import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, ScrollView, View, Text, StyleSheet } from 'react-native';
import { ticketTypeApi } from '../../api/ticketTypeApi';
import { getErrorMessage } from '../../api/apiClient';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { confirmDialog } from '../../components/ConfirmDialog';
import { formatCurrency } from '../../utils/formatCurrency';

function DetailRow({ label, value }) { return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value || '-'}</Text></View>; }
function StatusPill({ status }) { const active = status === 'Active'; return <View style={[styles.statusPill, active ? styles.activePill : styles.inactivePill]}><Text style={[styles.statusText, active ? styles.activeText : styles.inactiveText]}>{status || 'Unknown'}</Text></View>; }

export default function TicketTypeDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const load = async ({ silent = false } = {}) => {
    try {
      setError('');
      if (!silent) setLoading(true);
      const res = await ticketTypeApi.getById(id);
      setItem(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
      setItem(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, [id]);
  
  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      load({ silent: true });
    }, [id])
  );
  const onDelete = () => confirmDialog({ title: 'Delete ticket type?', message: 'Are you sure you want to delete this ticket type?', onConfirm: async () => { try { await ticketTypeApi.remove(id); Alert.alert('Success', 'Ticket type deleted'); navigation.goBack(); } catch (e) { Alert.alert('Error', getErrorMessage(e)); } } });
  if (loading) return <LoadingSpinner />;
  const percent = item ? Math.min(100, Math.round((Number(item.availableQuantity || 0) / Math.max(Number(item.totalQuantity || 1), 1)) * 100)) : 0;
  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <ErrorMessage message={error} />
      {item ? <View style={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.ticketIcon}><Text style={styles.ticketIconText}>🎟️</Text></View>
          <View style={styles.heroCopy}><View style={styles.topRow}><Text style={styles.kicker}>Ticket type</Text><StatusPill status={item.status} /></View><Text style={styles.title}>{item.name}</Text><Text style={styles.price}>{formatCurrency(item.price)}</Text><Text style={styles.subtitle}>{item.eventId?.title || 'Event not assigned'}</Text></View>
        </View>
        <View style={styles.statsRow}><View style={styles.statCard}><Text style={styles.statValue}>{item.totalQuantity}</Text><Text style={styles.statLabel}>Total</Text></View><View style={styles.statCard}><Text style={styles.statValue}>{item.availableQuantity}</Text><Text style={styles.statLabel}>Available</Text></View><View style={styles.statCard}><Text style={styles.statValue}>{percent}%</Text><Text style={styles.statLabel}>Left</Text></View></View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View>
        <AppCard><Text style={styles.sectionTitle}>Details</Text><DetailRow label="Event" value={item.eventId?.title || 'Event not assigned'} /><DetailRow label="Description" value={item.description || 'No description provided.'} /><DetailRow label="Price" value={formatCurrency(item.price)} /><DetailRow label="Total quantity" value={String(item.totalQuantity)} /><DetailRow label="Available quantity" value={String(item.availableQuantity)} /></AppCard>
        <View style={styles.actions}><AppButton title="Edit ticket type" onPress={() => navigation.navigate('EditTicketType', { id })} /><AppButton title="Delete ticket type" variant="danger" onPress={onDelete} /></View>
      </View> : <EmptyState title="Ticket type not found" actionTitle="Reload" onAction={load} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 20, backgroundColor: '#FFF7FB', paddingBottom: 34 }, content: { width: '100%', alignSelf: 'center' }, heroCard: { backgroundColor: '#F80678', borderRadius: 32, padding: 22, marginBottom: 16, flexDirection: 'row', shadowColor: '#F80678', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 8 }, ticketIcon: { width: 62, height: 62, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }, ticketIconText: { fontSize: 30 }, heroCopy: { flex: 1 }, topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, kicker: { color: '#FFE4F1', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' }, title: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 8 }, price: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 6 }, subtitle: { color: '#FFEAF4', fontSize: 14, marginTop: 6 }, statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }, activePill: { backgroundColor: '#DCFCE7' }, inactivePill: { backgroundColor: '#F3F4F6' }, statusText: { fontSize: 11, fontWeight: '900' }, activeText: { color: '#047857' }, inactiveText: { color: '#4B5563' }, statsRow: { flexDirection: 'row', marginHorizontal: -5, marginBottom: 10 }, statCard: { flex: 1, marginHorizontal: 5, backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#FCE1EE', alignItems: 'center' }, statValue: { color: '#1F1D2B', fontSize: 22, fontWeight: '900' }, statLabel: { color: '#8B7E93', fontSize: 12, fontWeight: '800', marginTop: 3 }, progressTrack: { height: 10, borderRadius: 10, backgroundColor: '#FFE4F1', marginBottom: 16, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: '#F80678', borderRadius: 10 }, sectionTitle: { color: '#1F1D2B', fontSize: 18, fontWeight: '900', marginBottom: 12 }, detailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1EAF3' }, detailLabel: { color: '#8B7E93', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 }, detailValue: { color: '#1F1D2B', fontSize: 15, fontWeight: '700', marginTop: 4 }, actions: { marginTop: 18 },
});
