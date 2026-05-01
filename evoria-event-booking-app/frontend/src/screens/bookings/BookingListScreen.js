import React, { useContext, useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { bookingApi } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';
import { formatDate } from '../../utils/formatDate';
import { AuthContext } from '../../context/AuthContext';

function StatusPill({ value }) {
  return (
    <View style={styles.statusPill}>
      <Text style={styles.statusText}>{value || 'Pending'}</Text>
    </View>
  );
}

function BookingCard({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress}>
      <AppCard>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.title}>Booking #{String(item._id).slice(-6).toUpperCase()}</Text>
            <Text style={styles.subtitle}>{item.event?.title || item.event || 'Event not loaded'}</Text>
          </View>
          <StatusPill value={item.status} />
        </View>
        <View style={styles.metaGrid}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Quantity</Text>
            <Text style={styles.metaValue}>{item.quantity}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Created</Text>
            <Text style={styles.metaValue}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

export default function BookingListScreen({ navigation }) {
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
      const res = isStaff ? await bookingApi.getAll() : await bookingApi.getMy();
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
          <Text style={styles.kicker}>{isStaff ? 'Management' : 'My activity'}</Text>
          <Text style={styles.pageTitle}>Bookings</Text>
          <Text style={styles.pageSubtitle}>{isStaff ? 'Review and manage all event reservations.' : 'Track your reservations and booking status.'}</Text>
        </View>
        {!isStaff ? <View style={styles.headerAction}><AppButton title="Create Booking" onPress={() => navigation.navigate('CreateBooking')} /></View> : null}
      </View>

      <ErrorMessage message={error} />

      {items.length === 0 ? (
        <EmptyState title="No bookings yet" actionTitle="Reload" onAction={() => load()} />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          renderItem={({ item }) => <BookingCard item={item} onPress={() => navigation.navigate('BookingDetails', { id: item._id })} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  header: { maxWidth: 980, width: '100%', alignSelf: 'center', marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1 },
  headerAction: { minWidth: 150 },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  pageTitle: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  pageSubtitle: { marginTop: 8, color: colors.muted, maxWidth: 720, fontSize: 15, lineHeight: 22 },
  listContent: { maxWidth: 980, width: '100%', alignSelf: 'center', paddingBottom: 20, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  title: { fontWeight: '900', color: colors.text, fontSize: 16, marginBottom: 5 },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 20 },
  statusPill: { backgroundColor: colors.background, borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { color: colors.primary, fontWeight: '900', fontSize: 11 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  metaBox: { flex: 1, minWidth: 130, backgroundColor: colors.background, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: colors.border },
  metaLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  metaValue: { color: colors.text, fontWeight: '900', marginTop: 4 },
});
