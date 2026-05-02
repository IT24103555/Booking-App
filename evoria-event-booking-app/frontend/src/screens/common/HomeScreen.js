import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { colors } from '../../constants/colors';
import { eventApi } from '../../api/eventApi';
import { API_BASE_URL } from '../../config/apiConfig';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';

const CATEGORIES = [
  { id: 'all', label: 'All Events', icon: '🎯' },
  { id: 'concerts', label: 'Concerts', icon: '🎵' },
  { id: 'conferences', label: 'Conferences', icon: '🎤' },
  { id: 'exhibitions', label: 'Exhibitions', icon: '🎨' },
  { id: 'workshops', label: 'Workshops', icon: '🛠️' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
];

function FeaturedEventCard({ event, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.featuredCard}>
      {event.image ? (
        <Image 
          source={{ uri: encodeURI(`${UPLOADS_BASE}${event.image}`) }} 
          style={styles.featuredImage}
          resizeMode="cover"
          onLoad={() => console.log('Image loaded', `${UPLOADS_BASE}${event.image}`)}
          onError={(e) => console.warn('Image load error', e.nativeEvent?.error, `${UPLOADS_BASE}${event.image}`)}
        />
      ) : (
        <View style={[styles.featuredImage, { backgroundColor: colors.primary }]} />
      )}
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>{event.title}</Text>
          <View style={styles.featuredMeta}>
            <Text style={styles.featuredMetaText}>📍 {event.venueId?.name || 'Venue TBA'}</Text>
            <Text style={styles.featuredMetaText}>📅 {event.eventDate ? String(event.eventDate).slice(0,10) : 'TBA'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EventGridCard({ event, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.gridCard}>
      {event.image ? (
        <Image 
          source={{ uri: encodeURI(`${UPLOADS_BASE}${event.image}`) }} 
          style={styles.gridImage}
          resizeMode="cover"
          onLoad={() => console.log('Image loaded', `${UPLOADS_BASE}${event.image}`)}
          onError={(e) => console.warn('Image load error', e.nativeEvent?.error, `${UPLOADS_BASE}${event.image}`)}
        />
      ) : (
        <View style={[styles.gridImage, { backgroundColor: colors.primary }]} />
      )}
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.gridVenue} numberOfLines={1}>{event.venueId?.name || 'Venue TBA'}</Text>
        <Text style={styles.gridDate}>{event.eventDate ? String(event.eventDate).slice(0,10) : 'TBA'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, searchText]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await eventApi.getAll();
      setEvents(res.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let result = events;

    if (searchText.trim()) {
      result = result.filter(e => 
        e.title.toLowerCase().includes(searchText.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      // Filter by category based on event title or description
      result = result.filter(e =>
        e.title.toLowerCase().includes(selectedCategory) ||
        e.description?.toLowerCase().includes(selectedCategory)
      );
    }

    setFilteredEvents(result);
  };

  const navigateToEventDetails = (eventId) => {
    navigation.navigate('EventDetails', { id: eventId });
  };

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.shell}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover Events</Text>
          <Text style={styles.headerSubtitle}>Find and book your favorite events</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive
              ]}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Events */}
        {filteredEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Events</Text>
            <View style={styles.gridContainer}>
              {filteredEvents.map((event) => (
                <EventGridCard
                  key={event._id}
                  event={event}
                  onPress={() => navigateToEventDetails(event._id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {filteredEvents.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>No events found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or selecting a different category
            </Text>
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
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  
  // Header
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.muted,
    lineHeight: 24,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 20,
    height: 48,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },

  // Categories
  categoriesScroll: {
    marginBottom: 24,
  },
  categoriesContainer: {
    gap: 10,
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  categoryLabelActive: {
    color: '#fff',
  },

  // Featured Cards
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 14,
    letterSpacing: -0.4,
  },
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    height: 280,
    backgroundColor: colors.primary,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredContent: {
    gap: 8,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.4,
  },
  featuredMeta: {
    gap: 6,
  },
  featuredMetaText: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '500',
  },

  // Grid Cards
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gridCard: {
    flexBasis: 'calc(50% - 6px)',
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.primary,
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  gridVenue: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
    marginBottom: 4,
  },
  gridDate: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
