import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text, TextInput, StyleSheet } from 'react-native';
import { ticketTypeApi } from '../../api/ticketTypeApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatCurrency';

const getAvailabilityPercent = (available, total) => {
  const safeTotal = Number(total) || 0;
  if (safeTotal <= 0) return 0;
  return Math.max(0, Math.min(100, (Number(available) / safeTotal) * 100));
};

function StatusPill({ status }) {
  const active = status === 'Active';
  return (
    <View style={[styles.statusPill, active ? styles.statusActive : styles.statusInactive]}>
      <Text style={[styles.statusText, active ? styles.statusActiveText : styles.statusInactiveText]}>
        {status || 'Unknown'}
      </Text>
    </View>
  );
}

export default function TicketTypeListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await ticketTypeApi.getAll();
      setItems(res.data || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return items;

    return items.filter((item) => {
      const searchable = `${item.name || ''} ${item.description || ''} ${item.status || ''} ${item.eventId?.title || ''}`.toLowerCase();
      return searchable.includes(value);
    });
  }, [items, search]);

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        total: acc.total + 1,
        available: acc.available + (Number(item.availableQuantity) || 0),
        capacity: acc.capacity + (Number(item.totalQuantity) || 0),
      }),
      { total: 0, available: 0, capacity: 0 }
    );
  }, [items]);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Inventory</Text>
          <Text style={styles.pageTitle}>Ticket Types</Text>
          <Text style={styles.pageSubtitle}>Create, monitor, and control every ticket category from one clean workspace.</Text>
        </View>
        <View style={styles.actionWrap}>
          <AppButton title="Add Ticket Type" onPress={() => navigation.navigate('AddTicketType')} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.total}</Text>
          <Text style={styles.statLabel}>Types</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.available}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.capacity}</Text>
          <Text style={styles.statLabel}>Capacity</Text>
        </View>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search ticket type, description, or status"
        placeholderTextColor={colors.muted}
        style={styles.searchInput}
      />

      <ErrorMessage message={error} />

      {filteredItems.length === 0 ? (
        <EmptyState title={items.length === 0 ? 'No ticket types' : 'No matching ticket types'} actionTitle="Reload" onAction={load} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const percent = getAvailabilityPercent(item.availableQuantity, item.totalQuantity);
            return (
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => navigation.navigate('TicketTypeDetails', { id: item._id })}
              >
                <AppCard>
                  <View style={styles.cardTop}>
                    <View style={styles.ticketIcon}>
                      <Text style={styles.ticketIconText}>🎟</Text>
                    </View>
                    <View style={styles.cardCopy}>
                      <Text style={styles.title}>{item.name}</Text>
                      <Text style={styles.subtitle}>{formatCurrency(item.price)}</Text>
                      <Text style={styles.eventLabel} numberOfLines={1}>{item.eventId?.title || 'Event not assigned'}</Text>
                    </View>
                    <StatusPill status={item.status} />
                  </View>

                  <Text style={styles.description} numberOfLines={2}>
                    {item.description || 'No description provided'}
                  </Text>

                  <View style={styles.progressHeader}>
                    <Text style={styles.meta}>Availability</Text>
                    <Text style={styles.metaStrong}>
                      {item.availableQuantity}/{item.totalQuantity}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${percent}%` }]} />
                  </View>
                </AppCard>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  header: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: { flex: 1 },
  actionWrap: { minWidth: 150 },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  pageTitle: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  pageSubtitle: { marginTop: 8, color: colors.muted, maxWidth: 720, fontSize: 15, lineHeight: 22 },
  statsRow: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  statValue: { color: colors.text, fontSize: 24, fontWeight: '900' },
  statLabel: { color: colors.muted, marginTop: 4, fontSize: 12, fontWeight: '700' },
  searchInput: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.text,
    marginBottom: 12,
    fontSize: 14,
  },
  listContent: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 24,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ticketIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketIconText: { fontSize: 20 },
  cardCopy: { flex: 1 },
  title: { fontWeight: '900', color: colors.text, fontSize: 16 },
  subtitle: { marginTop: 4, color: colors.primary, fontWeight: '800' },
  eventLabel: { marginTop: 6, color: colors.muted, fontSize: 12, fontWeight: '700' },
  description: { marginTop: 12, color: colors.muted, lineHeight: 20 },
  meta: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  metaStrong: { color: colors.text, fontSize: 12, fontWeight: '900' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 8 },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusInactive: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '900' },
  statusActiveText: { color: '#166534' },
  statusInactiveText: { color: '#991B1B' },
});
