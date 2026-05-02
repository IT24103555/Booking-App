import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView, TouchableOpacity, Image } from 'react-native';
import { eventApi } from '../../api/eventApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';
import { formatDate } from '../../utils/formatDate';
import { API_BASE_URL } from '../../config/apiConfig';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';
import { AuthContext } from '../../context/AuthContext';

function StatusPill({ status }) {
  const statusColors = {
    'Draft': '#f59e0b',
    'Published': '#10b981',
    'Cancelled': '#ef4444',
    'Completed': '#6b7280',
  };
  return (
    <View style={[styles.pill, { backgroundColor: statusColors[status] || colors.muted }]}>
      <Text style={styles.pillText}>{status || 'Unknown'}</Text>
    </View>
  );
}

function EventGridCard({ item, onPress, isStaff }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.gridCard}>
      {item.image ? (
        <Image 
          source={{ uri: encodeURI(`${UPLOADS_BASE}${item.image}`) }} 
          style={styles.gridImage}
          resizeMode="cover"
          onLoad={() => console.log('Image loaded', `${UPLOADS_BASE}${item.image}`)}
          onError={(e) => console.warn('Image load error', e.nativeEvent?.error, `${UPLOADS_BASE}${item.image}`)}
        />
      ) : (
        <View style={[styles.gridImage, { backgroundColor: colors.primary }]} />
      )}
      <View style={styles.cardContent}>
        <View style={styles.statusContainer}>
          <StatusPill status={item.status} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardVenue} numberOfLines={1}>📍 {item.venueId?.name || 'Venue TBA'}</Text>
        <Text style={styles.cardDate}>📅 {item.eventDate ? String(item.eventDate).slice(0,10) : 'TBA'}</Text>
        <Text style={styles.cardTime}>{item.startTime || '--:--'} - {item.endTime || '--:--'}</Text>
        {isStaff && (
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
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
    <ScrollView
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      <View style={styles.shell}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>Explore</Text>
            <Text style={styles.pageTitle}>Events</Text>
            <Text style={styles.pageSubtitle}>Browse and manage upcoming events</Text>
          </View>
          {isStaff && <View style={styles.headerAction}><AppButton title="New Event" onPress={() => navigation.navigate('AddEvent')} /></View>}
        </View>

        <ErrorMessage message={error} />

        {items.length === 0 ? (
          <EmptyState title="No events yet" actionTitle="Reload" onAction={() => load()} />
        ) : (
          <View style={styles.gridContainer}>
            {items.map((item) => (
              <EventGridCard
                key={item._id}
                item={item}
                isStaff={isStaff}
                onPress={() => navigation.navigate('EventDetails', { id: item._id })}
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
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  
  // Header
  header: {
    marginBottom: 24,
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
    maxWidth: 720,
  },

  // Grid Layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gridCard: {
    flexBasis: 'calc(33.333% - 8px)',
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
    height: 180,
    backgroundColor: colors.primary,
  },
  cardContent: {
    padding: 12,
  },
  statusContainer: {
    marginBottom: 8,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 19,
  },
  cardVenue: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 8,
  },
  editBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  editBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
