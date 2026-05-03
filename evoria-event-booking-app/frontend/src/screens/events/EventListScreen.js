import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { eventApi } from '../../api/eventApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatDate';
import { API_BASE_URL } from '../../config/apiConfig';
import { AuthContext } from '../../context/AuthContext';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';
const UI = { primary: '#EC168C', purple: '#7C3AED', background: '#FFF7FC', surface: '#FFFFFF', text: '#111827', muted: '#7C7C8A', border: '#F0DDEB', softPink: '#FFE7F4' };
const CATEGORIES = ['All', 'Music', 'Education', 'Tech', 'Sports'];

const imageUrl = (image) => {
  if (!image) return null;
  if (String(image).startsWith('http')) return image;
  return encodeURI(`${UPLOADS_BASE}${image}`);
};

function StatusPill({ status }) {
  const statusColors = { Draft: '#F59E0B', Published: '#10B981', Cancelled: '#EF4444', Completed: '#6B7280' };
  const color = statusColors[status] || UI.muted;
  return <View style={[styles.pill, { backgroundColor: `${color}22`, borderColor: `${color}66` }]}><Text style={[styles.pillText, { color }]}>{status || 'Unknown'}</Text></View>;
}

function EventRowCard({ item, onPress, onEditPress, isStaff }) {
  const uri = imageUrl(item.image);
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.eventCard}>
      {uri ? <Image source={{ uri }} style={styles.eventImage} /> : <View style={[styles.eventImage, styles.placeholder]}><Text style={styles.placeholderIcon}>🎫</Text></View>}
      <View style={styles.eventContent}>
        <View style={styles.topMetaRow}>
          <StatusPill status={item.status} />
          <Text style={styles.heart}>♡</Text>
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.eventMeta} numberOfLines={1}>📅 {formatDate(item.eventDate)} · {item.startTime || '--:--'}</Text>
        <Text style={styles.eventMeta} numberOfLines={1}>📍 {item.venueId?.name || 'Venue TBA'}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>LKR {item.ticketTypeIds?.[0]?.price || item.price || '1500'}</Text>
          {isStaff ? (
            <TouchableOpacity style={styles.smallEditButton} onPress={onEditPress}>
              <Text style={styles.smallEditText}>Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FloatingChatButton({ navigation, hidden }) {
  if (hidden) return null;
  return <TouchableOpacity style={styles.floatingChat} activeOpacity={0.88} onPress={() => navigation.navigate('Chatbot')}><Text style={styles.floatingChatText}>💬</Text></TouchableOpacity>;
}

export default function EventListScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'admin' || user?.role === 'organizer';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const load = async (isRefresh = false) => {
    try {
      setError('');
      isRefresh ? setRefreshing(true) : setLoading(true);
      // Admins/Organizers see ALL events, customers see only Published
      const res = isStaff ? await eventApi.getAllAdmin() : await eventApi.getAll();
      setItems(res.data || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load on mount or when user role changes
  useEffect(() => { load(); }, [isStaff]);

  // Auto-refresh when screen comes into focus (user navigates back after create/update/delete)
  useFocusEffect(
    React.useCallback(() => {
      // Silently reload data without showing loading spinner if data already exists
      if (items.length > 0) {
        load(true); // true = use refreshing state (pull-to-refresh spinner)
      }
    }, [])
  );

  const filtered = useMemo(() => {
    let result = items || [];
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((e) =>
        String(e.title || '').toLowerCase().includes(q) ||
        String(e.description || '').toLowerCase().includes(q) ||
        String(e.venueId?.name || '').toLowerCase().includes(q)
      );
    }
    if (category !== 'All') {
      const c = category.toLowerCase();
      result = result.filter((e) => String(e.category || e.title || e.description || '').toLowerCase().includes(c));
    }
    return result;
  }, [items, query, category]);

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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backText}>‹</Text></TouchableOpacity>
            <Text style={styles.pageTitle}>Events</Text>
            <View style={styles.backButtonPlaceholder} />
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput value={query} onChangeText={setQuery} placeholder="Search events..." placeholderTextColor={UI.muted} style={styles.searchInput} />
            </View>
            <TouchableOpacity style={styles.filterButton}><Text style={styles.filterIcon}>☰</Text></TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CATEGORIES.map((item) => (
              <TouchableOpacity key={item} style={[styles.chip, category === item && styles.chipActive]} onPress={() => setCategory(item)}>
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {isStaff ? <View style={styles.adminAction}><AppButton title="Add Event" onPress={() => navigation.navigate('AddEvent')} /></View> : null}
          <ErrorMessage message={error} />

          {filtered.length === 0 ? (
            <EmptyState title="No events found" actionTitle="Reload" onAction={() => load()} />
          ) : (
            <View style={styles.list}>
              {filtered.map((item) => (
                <EventRowCard
                  key={item._id}
                  item={item}
                  isStaff={isStaff}
                  onPress={() => navigation.navigate('EventDetails', { id: item._id })}
                  onEditPress={() => navigation.navigate('EditEvent', { id: item._id })}
                />
              ))}
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
  page: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 96 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: UI.border },
  backButtonPlaceholder: { width: 40, height: 40 },
  backText: { color: UI.text, fontSize: 28, lineHeight: 28, fontWeight: '900' },
  pageTitle: { color: UI.text, fontSize: 18, fontWeight: '900' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  searchBox: { flex: 1, height: 52, borderRadius: 18, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: UI.border },
  searchIcon: { fontSize: 18, color: UI.muted, marginRight: 8 },
  searchInput: { flex: 1, color: UI.text, fontSize: 14, fontWeight: '600' },
  filterButton: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: UI.border, alignItems: 'center', justifyContent: 'center' },
  filterIcon: { fontSize: 20, color: UI.text, transform: [{ rotate: '90deg' }] },
  chipRow: { gap: 10, paddingBottom: 18 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: UI.border },
  chipActive: { backgroundColor: UI.primary, borderColor: UI.primary },
  chipText: { color: UI.text, fontWeight: '800', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  adminAction: { marginBottom: 14 },
  list: { gap: 14 },
  eventCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 22, padding: 10, borderWidth: 1, borderColor: UI.border, shadowColor: '#9D174D', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 6 },
  eventImage: { width: 96, height: 104, borderRadius: 17, backgroundColor: UI.softPink },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 26 },
  eventContent: { flex: 1, paddingLeft: 12 },
  topMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  pill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 4 },
  pillText: { fontSize: 10, fontWeight: '900' },
  heart: { color: UI.primary, fontSize: 22, fontWeight: '900' },
  eventTitle: { color: UI.text, fontSize: 15, fontWeight: '900', lineHeight: 20 },
  eventMeta: { color: UI.muted, fontSize: 11, marginTop: 5, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  priceText: { color: UI.primary, fontSize: 12, fontWeight: '900' },
  smallEditButton: { backgroundColor: UI.softPink, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  smallEditText: { color: UI.primary, fontWeight: '900', fontSize: 11 },
  floatingChat: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: UI.primary, alignItems: 'center', justifyContent: 'center', shadowColor: UI.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 18, elevation: 12 },
  floatingChatText: { fontSize: 24 },
});
