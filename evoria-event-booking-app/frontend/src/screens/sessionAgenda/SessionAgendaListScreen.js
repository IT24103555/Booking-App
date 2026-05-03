import React, { useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, RefreshControl, TouchableOpacity, View, Text, TextInput, StyleSheet } from 'react-native';
import { sessionAgendaApi } from '../../api/sessionAgendaApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

function StatusPill({ status }) {
  const map = {
    Scheduled: ['#EDE9FE', '#5B21B6'],
    Completed: ['#DCFCE7', '#047857'],
    Cancelled: ['#FEE2E2', '#B91C1C'],
  };
  const [bg, fg] = map[status] || ['#F3F4F6', '#4B5563'];
  return <View style={[styles.statusPill, { backgroundColor: bg }]}><Text style={[styles.statusText, { color: fg }]}>{status || 'Unknown'}</Text></View>;
}

function SessionCard({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={styles.card}>
      <View style={styles.timeColumn}>
        <Text style={styles.startTime}>{item.startTime || '--:--'}</Text>
        <View style={styles.timeLine} />
        <Text style={styles.endTime}>{item.endTime || '--:--'}</Text>
      </View>
      <View style={styles.cardCopy}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <StatusPill status={item.status} />
        </View>
        <Text style={styles.eventText} numberOfLines={1}>🎫 {item.event?.title || item.event || 'Event not assigned'}</Text>
        <Text style={styles.speakerText} numberOfLines={1}>🎙 {item.speaker || 'Speaker TBA'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SessionAgendaListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async (isRefresh = false) => {
    try {
      setError('');
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await sessionAgendaApi.getAll();
      setItems(res.data || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (items.length > 0) {
        load(true); // Silently refresh
      }
    }, [])
  );

  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return items;
    return items.filter((item) => `${item.title || ''} ${item.speaker || ''} ${item.status || ''} ${item.event?.title || item.event || ''}`.toLowerCase().includes(value));
  }, [items, search]);

  const counts = useMemo(() => items.reduce((acc, item) => {
    acc.total += 1;
    if (item.status === 'Scheduled') acc.scheduled += 1;
    if (item.status === 'Completed') acc.completed += 1;
    return acc;
  }, { total: 0, scheduled: 0, completed: 0 }), [items]);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.kicker}>Program</Text>
        <Text style={styles.pageTitle}>Session Agendas</Text>
        <Text style={styles.pageSubtitle}>Plan talks, speakers, and event session timelines.</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statValue}>{counts.total}</Text><Text style={styles.statLabel}>Total</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{counts.scheduled}</Text><Text style={styles.statLabel}>Scheduled</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{counts.completed}</Text><Text style={styles.statLabel}>Done</Text></View>
        </View>
      </View>

      <View style={styles.toolbar}>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search sessions, speakers, or events" placeholderTextColor="#9A8EA4" style={styles.searchInput} />
        <AppButton title="Add Session" onPress={() => navigation.navigate('AddSessionAgenda')} />
      </View>

      <ErrorMessage message={error} />
      {filteredItems.length === 0 ? (
        <EmptyState title={items.length === 0 ? 'No sessions yet' : 'No matching sessions'} actionTitle="Reload" onAction={() => load()} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          renderItem={({ item }) => <SessionCard item={item} onPress={() => navigation.navigate('SessionAgendaDetails', { id: item._id })} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7FB', padding: 20 },
  headerCard: { backgroundColor: '#6C5CE7', borderRadius: 32, padding: 22, marginBottom: 16, shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 8 },
  kicker: { color: '#EDE9FE', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  pageTitle: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', marginTop: 6 },
  pageSubtitle: { color: '#F4F1FF', fontSize: 14, lineHeight: 21, marginTop: 8 },
  statsRow: { flexDirection: 'row', marginTop: 18 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 18, padding: 12, marginRight: 8 },
  statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#EDE9FE', fontSize: 11, fontWeight: '800', marginTop: 2 },
  toolbar: { marginBottom: 12 },
  searchInput: { height: 52, backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16, marginBottom: 12, color: '#1F1D2B', borderWidth: 1, borderColor: '#FCE1EE', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 },
  listContent: { paddingBottom: 26 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 26, padding: 16, marginBottom: 14, flexDirection: 'row', borderWidth: 1, borderColor: '#FCE1EE', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 4 },
  timeColumn: { width: 64, alignItems: 'center', marginRight: 14 },
  startTime: { color: '#6C5CE7', fontSize: 16, fontWeight: '900' },
  timeLine: { height: 42, width: 4, borderRadius: 4, backgroundColor: '#E9D5FF', marginVertical: 8 },
  endTime: { color: '#8B7E93', fontSize: 12, fontWeight: '800' },
  cardCopy: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { color: '#1F1D2B', fontSize: 16, fontWeight: '900', flex: 1, marginRight: 8 },
  eventText: { color: '#7A7185', fontSize: 13, marginTop: 10, fontWeight: '700' },
  speakerText: { color: '#7A7185', fontSize: 13, marginTop: 5, fontWeight: '700' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 10, fontWeight: '900' },
});
