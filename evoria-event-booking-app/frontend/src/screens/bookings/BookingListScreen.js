import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, RefreshControl, Image, SafeAreaView } from 'react-native';
import { bookingApi } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatDate';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/apiConfig';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';
const UI = { primary: '#EC168C', purple: '#7C3AED', background: '#FFF7FC', surface: '#FFFFFF', text: '#111827', muted: '#7C7C8A', border: '#F0DDEB', softPink: '#FFE7F4' };
const imageUrl = (image) => !image ? null : String(image).startsWith('http') ? image : encodeURI(`${UPLOADS_BASE}${image}`);

function getStatusColor(status) {
  const statusColors = { Pending: '#F59E0B', Confirmed: '#10B981', Cancelled: '#EF4444' };
  return statusColors[status] || UI.muted;
}

function BookingCard({ item, onPress }) {
  const eventTitle = item.eventId?.title || 'Event not loaded';
  const venueName = item.eventId?.venueId?.name || 'Venue TBA';
  const statusColor = getStatusColor(item.status);
  const uri = imageUrl(item.eventId?.image);

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.card}>
      {uri ? <Image source={{ uri }} style={styles.cardImage} /> : <View style={[styles.cardImage, styles.placeholder]}><Text style={styles.placeholderIcon}>🎫</Text></View>}
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{eventTitle}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22`, borderColor: `${statusColor}66` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.cardMeta} numberOfLines={1}>{formatDate(item.eventId?.eventDate || item.createdAt)}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>{venueName}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.ticketText}>{item.quantity || 0} Ticket{Number(item.quantity) === 1 ? '' : 's'}</Text>
          <Text style={styles.amountText}>NPR {Number(item.totalAmount || 0).toFixed(0)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function StatCard({ label, value, color }) {
  return <View style={styles.statCard}><Text style={[styles.statValue, { color }]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function FloatingChatButton({ navigation, hidden }) {
  if (hidden) return null;
  return <TouchableOpacity style={styles.floatingChat} activeOpacity={0.88} onPress={() => navigation.navigate('Chatbot')}><Text style={styles.floatingChatText}>💬</Text></TouchableOpacity>;
}

export default function BookingListScreen({ navigation }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const isStaff = user?.role === 'admin' || user?.role === 'organizer';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Upcoming');

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
    if (authLoading) return;
    load();
  }, [authLoading, user?.role]);

  const confirmedCount = items.filter((b) => b.status === 'Confirmed').length;
  const pendingCount = items.filter((b) => b.status === 'Pending').length;
  const cancelledCount = items.filter((b) => b.status === 'Cancelled').length;

  const filtered = useMemo(() => {
    if (tab === 'Past') return items.filter((b) => b.status === 'Cancelled');
    return items.filter((b) => b.status !== 'Cancelled');
  }, [items, tab]);

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.page}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={UI.primary} />}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.kicker}>{isStaff ? 'All reservations' : 'My reservations'}</Text>
              <Text style={styles.pageTitle}>{isStaff ? 'Bookings' : 'My Bookings'}</Text>
            </View>
            {!isStaff ? (
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateBooking')}>
                <Text style={styles.addButtonText}>＋</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addButtonPlaceholder} />
            )}
          </View>

          <View style={styles.statsRow}>
            <StatCard label="Confirmed" value={confirmedCount} color="#10B981" />
            <StatCard label="Pending" value={pendingCount} color="#F59E0B" />
            <StatCard label="Cancelled" value={cancelledCount} color="#EF4444" />
          </View>

          <View style={styles.tabRow}>
            {['Upcoming', 'Past'].map((item) => (
              <TouchableOpacity key={item} style={[styles.tabButton, tab === item && styles.tabButtonActive]} onPress={() => setTab(item)}>
                <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ErrorMessage message={error} />
          {filtered.length === 0 ? (
            <EmptyState title="No bookings found" actionTitle="Reload" onAction={() => load()} />
          ) : (
            <View style={styles.list}>
              {filtered.map((item) => <BookingCard key={item._id} item={item} onPress={() => navigation.navigate('BookingDetails', { id: item._id })} />)}
            </View>
          )}
        </ScrollView>
        <FloatingChatButton navigation={navigation} hidden={isStaff} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background },
  screen: { flex: 1, backgroundColor: UI.background },
  page: { padding: 18, paddingBottom: 98 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  kicker: { color: UI.primary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6 },
  pageTitle: { color: UI.text, fontSize: 28, fontWeight: '900', marginTop: 4 },
  addButton: { width: 48, height: 48, borderRadius: 18, backgroundColor: UI.primary, alignItems: 'center', justifyContent: 'center', shadowColor: UI.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  addButtonPlaceholder: { width: 48, height: 48 },
  addButtonText: { color: '#fff', fontSize: 27, lineHeight: 30, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: UI.border },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { color: UI.muted, fontSize: 11, fontWeight: '800', marginTop: 4 },
  tabRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 5, borderWidth: 1, borderColor: UI.border, marginBottom: 16 },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 14 },
  tabButtonActive: { backgroundColor: UI.primary },
  tabText: { color: UI.muted, fontWeight: '900' },
  tabTextActive: { color: '#fff' },
  list: { gap: 14 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 10, flexDirection: 'row', borderWidth: 1, borderColor: UI.border, shadowColor: '#9D174D', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 6 },
  cardImage: { width: 92, height: 100, borderRadius: 17, backgroundColor: UI.softPink },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 25 },
  cardContent: { flex: 1, paddingLeft: 12, justifyContent: 'space-between' },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardTitle: { flex: 1, color: UI.text, fontSize: 15, fontWeight: '900' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '900' },
  cardMeta: { color: UI.muted, fontSize: 12, fontWeight: '700', marginTop: 4 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  ticketText: { color: UI.muted, fontSize: 12, fontWeight: '800' },
  amountText: { color: UI.primary, fontSize: 13, fontWeight: '900' },
  floatingChat: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: UI.primary, alignItems: 'center', justifyContent: 'center', shadowColor: UI.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 18, elevation: 12 },
  floatingChatText: { fontSize: 24 },
});
