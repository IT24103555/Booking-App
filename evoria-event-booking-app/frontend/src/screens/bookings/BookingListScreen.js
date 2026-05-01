import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { bookingApi } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';
import { formatDate } from '../../utils/formatDate';
import { AuthContext } from '../../context/AuthContext';

function getStatusColor(status) {
  const statusColors = {
    'Pending': '#f59e0b',
    'Confirmed': '#10b981',
    'Cancelled': '#ef4444',
  };
  return statusColors[status] || colors.muted;
}

function BookingCard({ item, onPress }) {
  const eventTitle = item.eventId?.title || 'Event not loaded';
  const venueName = item.eventId?.venueId?.name || 'Venue TBA';
  const statusColor = getStatusColor(item.status);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{eventTitle}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>📍 {venueName}</Text>
            <Text style={styles.cardBookingId}>Booking #{String(item._id).slice(-6).toUpperCase()}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardDivider} />
      
      <View style={styles.cardFooter}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Tickets</Text>
          <Text style={styles.metaValue}>{item.quantity}x</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Total</Text>
          <Text style={styles.metaValue}>${item.totalAmount?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Date</Text>
          <Text style={styles.metaValue}>{formatDate(item.eventId?.eventDate || item.createdAt).split(',')[0]}</Text>
        </View>
      </View>
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

  const confirmedCount = items.filter(b => b.status === 'Confirmed').length;
  const pendingCount = items.filter(b => b.status === 'Pending').length;
  const cancelledCount = items.filter(b => b.status === 'Cancelled').length;

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      <View style={styles.shell}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>{isStaff ? 'Management' : 'My activity'}</Text>
            <Text style={styles.pageTitle}>Bookings</Text>
            <Text style={styles.pageSubtitle}>{isStaff ? 'Review and manage all reservations' : 'Track your reservations'}</Text>
          </View>
          {!isStaff && <View style={styles.headerAction}><AppButton title="New Booking" onPress={() => navigation.navigate('CreateBooking')} /></View>}
        </View>

        {/* Stats */}
        {items.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{confirmedCount}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{cancelledCount}</Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
          </View>
        )}

        <ErrorMessage message={error} />

        {/* Bookings List */}
        {items.length === 0 ? (
          <EmptyState title="No bookings yet" actionTitle="Reload" onAction={() => load()} />
        ) : (
          <View style={styles.listContainer}>
            {items.map((item) => (
              <BookingCard
                key={item._id}
                item={item}
                onPress={() => navigation.navigate('BookingDetails', { id: item._id })}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  shell: {
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },
  
  // Header
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerAction: {
    minWidth: 130,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  pageSubtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 600,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // List
  listContainer: {
    gap: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    gap: 10,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 3,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardBookingId: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
});
