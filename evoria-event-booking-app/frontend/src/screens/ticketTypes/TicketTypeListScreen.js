import React, { useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, TouchableOpacity, View, Text, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { ticketTypeApi } from '../../api/ticketTypeApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';

const getAvailabilityPercent = (available, total) => {
  const safeTotal = Number(total) || 0;
  if (safeTotal <= 0) return 0;
  return Math.max(0, Math.min(100, (Number(available) / safeTotal) * 100));
};
function StatusPill({ status }) { const active = status === 'Active'; return <View style={[styles.statusPill, active ? styles.activePill : styles.inactivePill]}><Text style={[styles.statusText, active ? styles.activeText : styles.inactiveText]}>{status || 'Unknown'}</Text></View>; }

export default function TicketTypeListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Enhanced load function with refresh state support
  const load = async (isRefresh = false) => {
    try {
      setError('');
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await ticketTypeApi.getAll();
      setItems(res.data || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load on mount
  useEffect(() => { load(); }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (items.length > 0) {
        load(true); // Silently refresh
      }
    }, [])
  );
  const filteredItems = useMemo(() => { const value = search.trim().toLowerCase(); if (!value) return items; return items.filter((item) => `${item.name || ''} ${item.description || ''} ${item.status || ''} ${item.eventId?.title || ''}`.toLowerCase().includes(value)); }, [items, search]);
  const summary = useMemo(() => items.reduce((acc, item) => ({ total: acc.total + 1, available: acc.available + (Number(item.availableQuantity) || 0), capacity: acc.capacity + (Number(item.totalQuantity) || 0) }), { total: 0, available: 0, capacity: 0 }), [items]);
  if (loading) return <LoadingSpinner />;
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}><Text style={styles.kicker}>Inventory</Text><Text style={styles.pageTitle}>Ticket Types</Text><Text style={styles.pageSubtitle}>Create, monitor, and control every ticket category from one polished workspace.</Text><View style={styles.statsRow}><View style={styles.statCard}><Text style={styles.statValue}>{summary.total}</Text><Text style={styles.statLabel}>Types</Text></View><View style={styles.statCard}><Text style={styles.statValue}>{summary.available}</Text><Text style={styles.statLabel}>Available</Text></View><View style={styles.statCard}><Text style={styles.statValue}>{summary.capacity}</Text><Text style={styles.statLabel}>Capacity</Text></View></View></View>
      <View style={styles.toolbar}><TextInput value={search} onChangeText={setSearch} placeholder="Search ticket type, event, or status" placeholderTextColor="#9A8EA4" style={styles.searchInput} /><AppButton title="Add Ticket Type" onPress={() => navigation.navigate('AddTicketType')} /></View>
      <ErrorMessage message={error} />
      {filteredItems.length === 0 ? <EmptyState title={items.length === 0 ? 'No ticket types' : 'No matching ticket types'} actionTitle="Reload" onAction={load} /> : <FlatList data={filteredItems} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#F80678" />} renderItem={({ item }) => { const percent = getAvailabilityPercent(item.availableQuantity, item.totalQuantity); return <TouchableOpacity activeOpacity={0.86} onPress={() => navigation.navigate('TicketTypeDetails', { id: item._id })} style={styles.card}><View style={styles.cardTop}><View style={styles.ticketIcon}><Text style={styles.ticketIconText}>🎟</Text></View><View style={styles.cardCopy}><Text style={styles.title}>{item.name}</Text><Text style={styles.subtitle}>{formatCurrency(item.price)}</Text><Text style={styles.eventLabel} numberOfLines={1}>{item.eventId?.title || 'Event not assigned'}</Text></View><StatusPill status={item.status} /></View><Text style={styles.description} numberOfLines={2}>{item.description || 'No description provided'}</Text><View style={styles.progressHeader}><Text style={styles.meta}>Availability</Text><Text style={styles.metaStrong}>{item.availableQuantity}/{item.totalQuantity}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View></TouchableOpacity>; }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7FB', padding: 20 }, heroCard: { backgroundColor: '#F80678', borderRadius: 32, padding: 22, marginBottom: 16, shadowColor: '#F80678', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 8 }, kicker: { color: '#FFE4F1', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' }, pageTitle: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', marginTop: 6 }, pageSubtitle: { color: '#FFEAF4', fontSize: 14, lineHeight: 21, marginTop: 8 }, statsRow: { flexDirection: 'row', marginTop: 18 }, statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 18, padding: 12, marginRight: 8 }, statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' }, statLabel: { color: '#FFEAF4', fontSize: 11, fontWeight: '800', marginTop: 2 }, toolbar: { marginBottom: 12 }, searchInput: { height: 52, backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16, marginBottom: 12, color: '#1F1D2B', borderWidth: 1, borderColor: '#FCE1EE', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 }, listContent: { paddingBottom: 28 }, card: { backgroundColor: '#FFFFFF', borderRadius: 26, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#FCE1EE', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 4 }, cardTop: { flexDirection: 'row', alignItems: 'center' }, ticketIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#FFF2F8', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, ticketIconText: { fontSize: 24 }, cardCopy: { flex: 1 }, title: { color: '#1F1D2B', fontSize: 17, fontWeight: '900' }, subtitle: { color: '#F80678', fontSize: 16, fontWeight: '900', marginTop: 3 }, eventLabel: { color: '#8B7E93', fontSize: 12, fontWeight: '700', marginTop: 3 }, description: { color: '#6E6478', fontSize: 13, lineHeight: 19, marginTop: 12 }, progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }, meta: { color: '#8B7E93', fontSize: 12, fontWeight: '800' }, metaStrong: { color: '#1F1D2B', fontSize: 12, fontWeight: '900' }, progressTrack: { height: 8, borderRadius: 10, backgroundColor: '#FFE4F1', marginTop: 8, overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 10, backgroundColor: '#F80678' }, statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }, activePill: { backgroundColor: '#DCFCE7' }, inactivePill: { backgroundColor: '#F3F4F6' }, statusText: { fontSize: 10, fontWeight: '900' }, activeText: { color: '#047857' }, inactiveText: { color: '#4B5563' },
});
