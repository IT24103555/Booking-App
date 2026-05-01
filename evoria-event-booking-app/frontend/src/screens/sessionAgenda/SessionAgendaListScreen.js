import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { sessionAgendaApi } from '../../api/sessionAgendaApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';

function SessionCard({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress}>
      <AppCard>
        <View style={styles.cardRow}>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>{item.startTime || '--:--'}</Text>
            <Text style={styles.timeEnd}>{item.endTime || '--:--'}</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.pill}><Text style={styles.pillText}>{item.status}</Text></View>
            </View>
            <Text style={styles.subtitle}>Event: {item.event?.title || item.event || 'Not assigned'}</Text>
            <Text style={styles.meta}>Speaker: {item.speaker || 'To be announced'}</Text>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

export default function SessionAgendaListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>Program</Text>
          <Text style={styles.pageTitle}>Session Agendas</Text>
          <Text style={styles.pageSubtitle}>Plan talks, speakers, and event session timelines.</Text>
        </View>
        <View style={styles.headerAction}><AppButton title="Add Session" onPress={() => navigation.navigate('AddSessionAgenda')} /></View>
      </View>

      <ErrorMessage message={error} />
      {items.length === 0 ? (
        <EmptyState title="No sessions yet" actionTitle="Reload" onAction={() => load()} />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          renderItem={({ item }) => <SessionCard item={item} onPress={() => navigation.navigate('SessionAgendaDetails', { id: item._id })} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  header: { maxWidth: 980, width: '100%', alignSelf: 'center', marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1 },
  headerAction: { minWidth: 140 },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  pageTitle: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  pageSubtitle: { marginTop: 8, color: colors.muted, maxWidth: 720, fontSize: 15, lineHeight: 22 },
  listContent: { maxWidth: 980, width: '100%', alignSelf: 'center', paddingBottom: 20, gap: 12 },
  cardRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  timeBadge: { width: 74, backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 12, alignItems: 'center' },
  timeText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  timeEnd: { color: '#fff', opacity: 0.78, fontSize: 12, marginTop: 3, fontWeight: '700' },
  cardContent: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  title: { flex: 1, fontWeight: '900', color: colors.text, fontSize: 16, lineHeight: 21 },
  subtitle: { marginTop: 7, color: colors.muted, fontWeight: '700' },
  meta: { marginTop: 6, color: colors.muted, fontSize: 13 },
  pill: { backgroundColor: colors.background, borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { color: colors.primary, fontWeight: '900', fontSize: 11 },
});
