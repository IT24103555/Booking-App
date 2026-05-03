import React, { useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, Image, TouchableOpacity, View, Text, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { venueApi } from '../../api/venueApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { API_BASE_URL } from '../../config/apiConfig';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';

const imageUrl = (image) => {
  if (!image) return null;
  if (String(image).startsWith('http')) return image;
  return encodeURI(`${UPLOADS_BASE}${image}`);
};

function StatusPill({ status }) {
  const available = status === 'Available';
  return (
    <View style={[styles.statusPill, available ? styles.availablePill : styles.unavailablePill]}>
      <Text style={[styles.statusText, available ? styles.availableText : styles.unavailableText]}>{status || 'Unknown'}</Text>
    </View>
  );
}

export default function VenueListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async (isRefresh = false) => {
    try {
      setError('');
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await venueApi.getAll();
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
    return items.filter((item) => `${item.name || ''} ${item.location || ''} ${item.status || ''} ${item.description || ''}`.toLowerCase().includes(value));
  }, [items, search]);

  const summary = useMemo(
    () =>
      items.reduce(
        (acc, item) => ({
          total: acc.total + 1,
          available: acc.available + (item.status === 'Available' ? 1 : 0),
          capacity: acc.capacity + (Number(item.capacity) || 0),
        }),
        { total: 0, available: 0, capacity: 0 }
      ),
    [items]
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Spaces</Text>
        <Text style={styles.pageTitle}>Venues</Text>
        <Text style={styles.pageSubtitle}>Manage locations, capacities, and availability with a clean event-planning view.</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statValue}>{summary.total}</Text><Text style={styles.statLabel}>Venues</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{summary.available}</Text><Text style={styles.statLabel}>Available</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{summary.capacity}</Text><Text style={styles.statLabel}>Capacity</Text></View>
        </View>
      </View>

      <View style={styles.toolbar}>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search venue, location, description, or status" placeholderTextColor="#9A8EA4" style={styles.searchInput} />
        <AppButton title="Add Venue" onPress={() => navigation.navigate('AddVenue')} />
      </View>

      <ErrorMessage message={error} />

      {filteredItems.length === 0 ? (
        <EmptyState title={items.length === 0 ? 'No venues' : 'No matching venues'} actionTitle="Reload" onAction={load} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#5E60CE" />}
          renderItem={({ item }) => {
            const uri = imageUrl(item.image);
            return (
              <TouchableOpacity activeOpacity={0.86} onPress={() => navigation.navigate('VenueDetails', { id: item._id })} style={styles.card}>
                {uri ? <Image source={{ uri }} style={styles.thumbnail} /> : <View style={styles.thumbnailPlaceholder}><Text style={styles.thumbnailIcon}>🏛️</Text></View>}
                <View style={styles.cardCopy}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
                    <StatusPill status={item.status} />
                  </View>
                  <Text style={styles.subtitle} numberOfLines={1}>📍 {item.location}</Text>
                  <Text style={styles.meta}>Capacity: {item.capacity}</Text>
                  <Text style={styles.description} numberOfLines={2}>{item.description || 'No description provided'}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7FB', padding: 20 },
  heroCard: { backgroundColor: '#6C5CE7', borderRadius: 32, padding: 22, marginBottom: 16, shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 8 },
  kicker: { color: '#EDE9FE', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  pageTitle: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', marginTop: 6 },
  pageSubtitle: { color: '#F4F1FF', fontSize: 14, lineHeight: 21, marginTop: 8 },
  statsRow: { flexDirection: 'row', marginTop: 18 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 18, padding: 12, marginRight: 8 },
  statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#EDE9FE', fontSize: 11, fontWeight: '800', marginTop: 2 },
  toolbar: { marginBottom: 12 },
  searchInput: { height: 52, backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16, marginBottom: 12, color: '#1F1D2B', borderWidth: 1, borderColor: '#FCE1EE', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 },
  listContent: { paddingBottom: 28 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 26, padding: 12, marginBottom: 14, flexDirection: 'row', borderWidth: 1, borderColor: '#FCE1EE', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 4 },
  thumbnail: { width: 86, height: 96, borderRadius: 20, marginRight: 12 },
  thumbnailPlaceholder: { width: 86, height: 96, borderRadius: 20, marginRight: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  thumbnailIcon: { fontSize: 28 },
  cardCopy: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#1F1D2B', fontSize: 17, fontWeight: '900', flex: 1, marginRight: 8 },
  subtitle: { color: '#7A7185', fontSize: 13, fontWeight: '700', marginTop: 6 },
  meta: { color: '#F80678', fontSize: 12, fontWeight: '900', marginTop: 6 },
  description: { color: '#6E6478', fontSize: 12, lineHeight: 17, marginTop: 6 },
  statusPill: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999 },
  availablePill: { backgroundColor: '#DCFCE7' },
  unavailablePill: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 10, fontWeight: '900' },
  availableText: { color: '#047857' },
  unavailableText: { color: '#B91C1C' },
});