import React, { useContext, useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { eventApi } from '../../api/eventApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';
import { formatDate } from '../../utils/formatDate';
import { AuthContext } from '../../context/AuthContext';

function StatusPill({ status }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{status || 'Unknown'}</Text>
    </View>
  );
}

function EventCard({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress}>
      <AppCard>
        <View style={styles.cardTopRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateMonth}>{String(formatDate(item.eventDate)).slice(0, 3)}</Text>
            <Text style={styles.dateDay}>{String(new Date(item.eventDate).getDate()).padStart(2, '0')}</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.title}</Text>
              <StatusPill status={item.status} />
            </View>
            <Text style={styles.subtitle}>{formatDate(item.eventDate)} · {item.startTime || '--:--'} - {item.endTime || '--:--'}</Text>
            <Text style={styles.meta}>Venue: {item.venue?.name || item.venue || 'Not assigned'}</Text>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

export default function EventListScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'admin' || user?.role === 'organizer';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async (isRefresh = false) => {
    try {
      setError('');
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await eventApi.getAll();
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
          <Text style={styles.kicker}>Discover</Text>
          <Text style={styles.pageTitle}>Events</Text>
          <Text style={styles.pageSubtitle}>Browse upcoming sessions, workshops, and university events.</Text>
        </View>
        {isStaff ? <View style={styles.headerAction}><AppButton title="Add Event" onPress={() => navigation.navigate('AddEvent')} /></View> : null}
      </View>

      <ErrorMessage message={error} />

      {items.length === 0 ? (
        <EmptyState title="No events yet" actionTitle="Reload" onAction={() => load()} />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          renderItem={({ item }) => <EventCard item={item} onPress={() => navigation.navigate('EventDetails', { id: item._id })} />}
          ListFooterComponent={<View style={styles.footerSpace} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  header: { maxWidth: 980, width: '100%', alignSelf: 'center', marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1 },
  headerAction: { minWidth: 130 },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  pageTitle: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  pageSubtitle: { marginTop: 8, color: colors.muted, maxWidth: 720, fontSize: 15, lineHeight: 22 },
  listContent: { maxWidth: 980, width: '100%', alignSelf: 'center', paddingBottom: 20, gap: 12 },
  cardTopRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  dateBlock: { width: 58, borderRadius: 18, backgroundColor: colors.primary, paddingVertical: 10, alignItems: 'center' },
  dateMonth: { color: '#fff', opacity: 0.85, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  dateDay: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 2 },
  cardContent: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' },
  title: { flex: 1, fontWeight: '900', color: colors.text, fontSize: 16, lineHeight: 21 },
  subtitle: { marginTop: 7, color: colors.muted, fontWeight: '700' },
  meta: { marginTop: 7, color: colors.muted, fontSize: 13, lineHeight: 19 },
  pill: { backgroundColor: colors.background, borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { color: colors.primary, fontWeight: '900', fontSize: 11 },
  footerSpace: { height: 10 },
});
