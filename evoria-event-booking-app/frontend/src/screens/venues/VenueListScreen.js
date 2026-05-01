import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, TouchableOpacity, View, Text, TextInput, StyleSheet } from 'react-native';
import { venueApi } from '../../api/venueApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';

function StatusPill({ status }) {
  const available = status === 'Available';
  return (
    <View style={[styles.statusPill, available ? styles.availablePill : styles.unavailablePill]}>
      <Text style={[styles.statusText, available ? styles.availableText : styles.unavailableText]}>
        {status || 'Unknown'}
      </Text>
    </View>
  );
}

export default function VenueListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await venueApi.getAll();
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
      const searchable = `${item.name || ''} ${item.location || ''} ${item.status || ''} ${item.description || ''}`.toLowerCase();
      return searchable.includes(value);
    });
  }, [items, search]);

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        total: acc.total + 1,
        available: acc.available + (item.status === 'Available' ? 1 : 0),
        capacity: acc.capacity + (Number(item.capacity) || 0),
      }),
      { total: 0, available: 0, capacity: 0 }
    );
  }, [items]);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Spaces</Text>
          <Text style={styles.pageTitle}>Venues</Text>
          <Text style={styles.pageSubtitle}>Manage campus locations, capacities, and availability with a clear event-planning view.</Text>
        </View>
        <View style={styles.actionWrap}>
          <AppButton title="Add Venue" onPress={() => navigation.navigate('AddVenue')} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.total}</Text>
          <Text style={styles.statLabel}>Venues</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.available}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{summary.capacity}</Text>
          <Text style={styles.statLabel}>Total capacity</Text>
        </View>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search venue, location, description, or status"
        placeholderTextColor={colors.muted}
        style={styles.searchInput}
      />

      <ErrorMessage message={error} />

      {filteredItems.length === 0 ? (
        <EmptyState title={items.length === 0 ? 'No venues' : 'No matching venues'} actionTitle="Reload" onAction={load} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.86} onPress={() => navigation.navigate('VenueDetails', { id: item._id })}>
              <AppCard>
                <View style={styles.venueCard}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.thumbnail} />
                  ) : (
                    <View style={styles.thumbnailPlaceholder}>
                      <Text style={styles.thumbnailIcon}>🏛️</Text>
                    </View>
                  )}

                  <View style={styles.cardCopy}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                      <StatusPill status={item.status} />
                    </View>
                    <Text style={styles.subtitle} numberOfLines={1}>{item.location}</Text>
                    <Text style={styles.meta}>Capacity: {item.capacity}</Text>
                    <Text style={styles.description} numberOfLines={2}>
                      {item.description || 'No description provided'}
                    </Text>
                  </View>
                </View>
              </AppCard>
            </TouchableOpacity>
          )}
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
  actionWrap: { minWidth: 140 },
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
  listContent: { maxWidth: 980, width: '100%', alignSelf: 'center', paddingBottom: 24 },
  venueCard: { flexDirection: 'row', gap: 14 },
  thumbnail: { width: 96, height: 96, borderRadius: 18 },
  thumbnailPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: { fontSize: 28 },
  cardCopy: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1, fontWeight: '900', color: colors.text, fontSize: 16 },
  subtitle: { marginTop: 5, color: colors.muted, fontWeight: '700' },
  meta: { marginTop: 7, color: colors.primary, fontSize: 12, fontWeight: '900' },
  description: { marginTop: 8, color: colors.muted, lineHeight: 19 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  availablePill: { backgroundColor: '#DCFCE7' },
  unavailablePill: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '900' },
  availableText: { color: '#166534' },
  unavailableText: { color: '#991B1B' },
});
