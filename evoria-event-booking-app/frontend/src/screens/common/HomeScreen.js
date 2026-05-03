import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { eventApi } from '../../api/eventApi';
import NotificationBellButton from '../../components/NotificationBellButton';
import { API_BASE_URL } from '../../config/apiConfig';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';
const UI = {
  primary: '#EC168C',
  purple: '#7C3AED',
  background: '#FFF7FC',
  surface: '#FFFFFF',
  text: '#111827',
  muted: '#7C7C8A',
  border: '#F0DDEB',
  softPink: '#FFE7F4',
  green: '#10B981',
};

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'education', label: 'Education' },
  { id: 'tech', label: 'Tech' },
  { id: 'sports', label: 'Sports' },
];

const imageUrl = (image) => {
  if (!image) return null;
  if (String(image).startsWith('http')) return image;
  return encodeURI(`${UPLOADS_BASE}${image}`);
};

function SectionHeader({ title, onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function CategoryChip({ item, selected, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.chip, selected && styles.chipActive]}>
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

function EventPosterCard({ event, onPress }) {
  const uri = imageUrl(event.image);
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.posterCard} onPress={onPress}>
      {uri ? <Image source={{ uri }} style={styles.posterImage} /> : <View style={[styles.posterImage, styles.imagePlaceholder]}><Text style={styles.placeholderIcon}>🎫</Text></View>}
      <View style={styles.posterBody}>
        <Text style={styles.posterTitle} numberOfLines={2}>{event.title || 'Untitled Event'}</Text>
        <Text style={styles.posterMeta} numberOfLines={1}>{String(event.eventDate || '').slice(0, 10) || 'Date TBA'} · {event.startTime || 'Time TBA'}</Text>
        <Text style={styles.posterVenue} numberOfLines={1}>{event.venueId?.name || 'Venue TBA'}</Text>
        <Text style={styles.priceText}>LKR {event.ticketTypeIds?.[0]?.price || event.price || '1500'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function PopularCard({ event, onPress, liked, onLikePress }) {
  const uri = imageUrl(event.image);
  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.popularCard} onPress={onPress}>
      {uri ? <Image source={{ uri }} style={styles.popularImage} /> : <View style={[styles.popularImage, styles.imagePlaceholder]}><Text style={styles.placeholderIcon}>🎤</Text></View>}
      <View style={styles.popularContent}>
        <Text style={styles.popularTitle} numberOfLines={1}>{event.title || 'Event'}</Text>
        <Text style={styles.popularMeta} numberOfLines={1}>📍 {event.venueId?.name || 'Venue TBA'}</Text>
        <Text style={styles.popularMeta}>📅 {String(event.eventDate || '').slice(0, 10) || 'TBA'}</Text>
      </View>
      <TouchableOpacity activeOpacity={0.8} onPress={onLikePress} style={styles.heartButton}>
        <Text style={[styles.heart, liked && styles.heartActive]}>{liked ? '♥' : '♡'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function FloatingChatButton({ navigation }) {
  return (
    <TouchableOpacity activeOpacity={0.88} style={styles.floatingChat} onPress={() => navigation.navigate('Chatbot')}>
      <Text style={styles.floatingChatText}>💬</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [likedEventIds, setLikedEventIds] = useState([]);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await eventApi.getAll();
      setEvents(res.data || []);
    } catch (e) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    let result = events || [];
    const query = searchText.trim().toLowerCase();
    if (query) {
      result = result.filter((e) =>
        String(e.title || '').toLowerCase().includes(query) ||
        String(e.description || '').toLowerCase().includes(query) ||
        String(e.venueId?.name || '').toLowerCase().includes(query)
      );
    }
    if (selectedCategory !== 'all') {
      result = result.filter((e) =>
        String(e.category || '').trim().toLowerCase() === selectedCategory
      );
    }
    return result;
  }, [events, searchText, selectedCategory]);

  const navigateToEventDetails = (eventId) => navigation.navigate('EventDetails', { id: eventId });

  const toggleLike = (eventId) => {
    setLikedEventIds((current) => (
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.locationLabel}>Location</Text>
              <Text style={styles.locationText}>📍 Colombo, Sri Lanka</Text>
            </View>
            <NotificationBellButton size={44} />
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search events, artists, venues..."
                placeholderTextColor={UI.muted}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => Alert.alert('Filter', 'Quick filters are not configured yet. Use search or categories for now.')}
            ><Text style={styles.filterIcon}>☰</Text></TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CATEGORIES.map((item) => (
              <CategoryChip
                key={item.id}
                item={item}
                selected={selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id)}
              />
            ))}
          </ScrollView>

          <SectionHeader title="Upcoming Events" onPress={() => navigation.navigate('EventList')} />
          {loading ? (
            <View style={styles.loadingCard}><ActivityIndicator color={UI.primary} /><Text style={styles.loadingText}>Loading events...</Text></View>
          ) : filteredEvents.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {filteredEvents.slice(0, 8).map((event) => (
                <EventPosterCard key={event._id} event={event} onPress={() => navigateToEventDetails(event._id)} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyCard}><Text style={styles.emptyIcon}>🎟️</Text><Text style={styles.emptyTitle}>No events found</Text><Text style={styles.emptyText}>Try another search or category.</Text></View>
          )}

          <SectionHeader title="Popular Now" onPress={() => navigation.navigate('EventList')} />
          <View style={styles.popularList}>
            {filteredEvents.slice(0, 4).map((event) => (
              <PopularCard
                key={event._id}
                event={event}
                onPress={() => navigateToEventDetails(event._id)}
                liked={likedEventIds.includes(event._id)}
                onLikePress={() => toggleLike(event._id)}
              />
            ))}
          </View>
        </ScrollView>
        <FloatingChatButton navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background },
  screen: { flex: 1, backgroundColor: UI.background },
  page: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  locationLabel: { color: UI.muted, fontSize: 12, fontWeight: '700' },
  locationText: { color: UI.text, fontSize: 16, fontWeight: '900', marginTop: 4 },
  notificationButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: UI.border },
  notificationIcon: { fontSize: 19 },
  notificationDot: { position: 'absolute', right: 11, top: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: UI.primary },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  searchBox: { flex: 1, height: 52, borderRadius: 18, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: UI.border },
  searchIcon: { fontSize: 19, color: UI.muted, marginRight: 8 },
  searchInput: { flex: 1, color: UI.text, fontSize: 14, fontWeight: '600' },
  filterButton: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: UI.border, alignItems: 'center', justifyContent: 'center' },
  filterIcon: { fontSize: 20, color: UI.text, transform: [{ rotate: '90deg' }] },
  chipRow: { gap: 10, paddingBottom: 18 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: UI.border },
  chipActive: { backgroundColor: UI.primary, borderColor: UI.primary },
  chipText: { color: UI.text, fontWeight: '800', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 14 },
  sectionTitle: { color: UI.text, fontSize: 18, fontWeight: '900' },
  viewAll: { color: UI.primary, fontWeight: '900', fontSize: 12 },
  horizontalList: { gap: 14, paddingBottom: 10 },
  posterCard: { width: 170, backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: UI.border, shadowColor: '#9D174D', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.09, shadowRadius: 18, elevation: 7 },
  posterImage: { width: '100%', height: 128, backgroundColor: UI.softPink },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 32 },
  posterBody: { padding: 12 },
  posterTitle: { color: UI.text, fontSize: 14, fontWeight: '900', lineHeight: 18 },
  posterMeta: { color: UI.muted, fontSize: 11, marginTop: 7, fontWeight: '700' },
  posterVenue: { color: UI.muted, fontSize: 11, marginTop: 4, fontWeight: '700' },
  priceText: { color: UI.primary, fontSize: 12, fontWeight: '900', marginTop: 10 },
  popularList: { gap: 12 },
  popularCard: { backgroundColor: '#fff', borderRadius: 22, padding: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: UI.border, shadowColor: '#9D174D', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 5 },
  popularImage: { width: 78, height: 78, borderRadius: 16, backgroundColor: UI.softPink },
  popularContent: { flex: 1, paddingHorizontal: 12 },
  popularTitle: { color: UI.text, fontSize: 14, fontWeight: '900' },
  popularMeta: { color: UI.muted, fontSize: 12, marginTop: 5, fontWeight: '700' },
  heartButton: { padding: 4 },
  heart: { color: UI.primary, fontSize: 25, fontWeight: '900' },
  heartActive: { color: '#EF4444' },
  loadingCard: { height: 120, backgroundColor: '#fff', borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: UI.border },
  loadingText: { color: UI.muted, fontWeight: '700', marginTop: 8 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 22, alignItems: 'center', padding: 24, borderWidth: 1, borderColor: UI.border },
  emptyIcon: { fontSize: 34 },
  emptyTitle: { color: UI.text, fontWeight: '900', fontSize: 16, marginTop: 8 },
  emptyText: { color: UI.muted, fontWeight: '600', marginTop: 4 },
  floatingChat: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: UI.primary, alignItems: 'center', justifyContent: 'center', shadowColor: UI.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 18, elevation: 12 },
  floatingChatText: { fontSize: 24 },
});
