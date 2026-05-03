import React, { useContext, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { eventApi } from '../../api/eventApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { confirmDialog } from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/apiConfig';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';
const UI = { primary: '#EC168C', purple: '#7C3AED', background: '#FFF7FC', surface: '#FFFFFF', text: '#111827', muted: '#7C7C8A', border: '#F0DDEB', softPink: '#FFE7F4' };
const imageUrl = (image) => !image ? null : String(image).startsWith('http') ? image : encodeURI(`${UPLOADS_BASE}${image}`);

function DetailLine({ icon, label, value }) {
  return (
    <View style={styles.detailLine}>
      <View style={styles.detailIcon}><Text>{icon}</Text></View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || '-'}</Text>
      </View>
    </View>
  );
}

function Chip({ label }) {
  return <View style={styles.highlightChip}><Text style={styles.highlightText}>{label}</Text></View>;
}

export default function EventDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'admin' || user?.role === 'organizer';
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);

  const load = async ({ silent = false } = {}) => {
    try {
      setError('');
      if (!silent) setLoading(true); // Only show loading on first load, not on focus refresh
      const res = await eventApi.getById(id);
      setItem(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount or when ID changes
  useEffect(() => { load(); }, [id]);

  // Auto-refresh when screen comes into focus (user navigates back after update/status change)
  useFocusEffect(
    React.useCallback(() => {
      // Reload data silently (no loading spinner) since user is already viewing the details
      load({ silent: true });
    }, [id])
  );

  const onDelete = () => {
    confirmDialog({
      title: 'Delete event?',
      message: 'Are you sure you want to delete this event?',
      onConfirm: async () => {
        try {
          await eventApi.remove(id);
          Alert.alert('Success', 'Event deleted');
          navigation.goBack();
        } catch (e) {
          Alert.alert('Error', getErrorMessage(e));
        }
      },
    });
  };

  if (loading) return <LoadingSpinner />;
  const uri = imageUrl(item?.image);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <ErrorMessage message={error} />
          {item ? (
            <>
              <View style={styles.imageWrap}>
                {uri ? <Image source={{ uri }} style={styles.heroImage} /> : <View style={[styles.heroImage, styles.placeholder]}><Text style={styles.placeholderIcon}>🎫</Text></View>}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backText}>‹</Text></TouchableOpacity>
                <TouchableOpacity style={styles.likeButton} onPress={() => setLiked((current) => !current)}>
                  <Text style={[styles.likeText, liked && styles.likeTextActive]}>{liked ? '♥' : '♡'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.contentCard}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.category}>{item.category || 'Music Festival'}</Text>

                <View style={styles.detailsBlock}>
                  <DetailLine icon="📅" label="Date & Time" value={`${formatDate(item.eventDate)} · ${item.startTime || '--:--'} - ${item.endTime || '--:--'}`} />
                  <DetailLine icon="📍" label="Venue" value={item.venueId?.name || item.venue?.name || 'Venue TBA'} />
                  <DetailLine icon="🎟️" label="Status" value={item.status || 'Published'} />
                </View>

                <Text style={styles.sectionTitle}>About Event</Text>
                <Text style={styles.description}>{item.description || 'Join us for a memorable event experience with amazing performances, activities, and sessions.'}</Text>

                <Text style={styles.sectionTitle}>Highlights</Text>
                <View style={styles.chipWrap}>
                  <Chip label="Live Event" />
                  <Chip label="Food Stalls" />
                  <Chip label="Networking" />
                  <Chip label="Sessions" />
                </View>

                {isStaff ? (
                  <View style={styles.staffActions}>
                    <AppButton title="Edit Event" onPress={() => navigation.navigate('EditEvent', { id })} />
                    <View style={{ height: 10 }} />
                    <AppButton title="Delete Event" variant="danger" onPress={onDelete} />
                  </View>
                ) : null}
              </View>
            </>
          ) : (
            <EmptyState title="Event not found" actionTitle="Go back" onAction={() => navigation.goBack()} />
          )}
        </ScrollView>

        {item && !isStaff ? (
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.priceLabel}>LKR {item.ticketTypeIds?.[0]?.price || item.price || '1500'}</Text>
              <Text style={styles.priceSub}>Onwards</Text>
            </View>
            <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate('CreateBooking', { eventId: item._id })}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background },
  screen: { flex: 1, backgroundColor: UI.background },
  page: { paddingBottom: 120 },
  imageWrap: { margin: 18, borderRadius: 28, overflow: 'hidden', backgroundColor: UI.softPink, height: 250, shadowColor: '#9D174D', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.12, shadowRadius: 22, elevation: 8 },
  heroImage: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 42 },
  backButton: { position: 'absolute', left: 14, top: 14, width: 42, height: 42, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 30, lineHeight: 30, fontWeight: '900', color: UI.text },
  likeButton: { position: 'absolute', right: 14, top: 14, width: 42, height: 42, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  likeText: { fontSize: 25, fontWeight: '900', color: UI.primary },
  likeTextActive: { color: '#EF4444' },
  contentCard: { backgroundColor: '#fff', marginHorizontal: 18, marginTop: -4, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: UI.border },
  title: { color: UI.text, fontSize: 25, lineHeight: 31, fontWeight: '900' },
  category: { color: UI.primary, fontWeight: '900', marginTop: 8, fontSize: 14 },
  detailsBlock: { marginTop: 20, gap: 13 },
  detailLine: { flexDirection: 'row', alignItems: 'center' },
  detailIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: UI.softPink, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  detailContent: { flex: 1 },
  detailLabel: { color: UI.muted, fontSize: 12, fontWeight: '800' },
  detailValue: { color: UI.text, fontSize: 14, fontWeight: '800', marginTop: 3 },
  sectionTitle: { color: UI.text, fontSize: 17, fontWeight: '900', marginTop: 24, marginBottom: 10 },
  description: { color: UI.muted, fontSize: 14, lineHeight: 23, fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  highlightChip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFF0F8', borderColor: UI.border, borderWidth: 1, borderRadius: 999 },
  highlightText: { color: UI.primary, fontWeight: '800', fontSize: 12 },
  staffActions: { marginTop: 20 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: UI.border, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { color: UI.primary, fontSize: 17, fontWeight: '900' },
  priceSub: { color: UI.muted, fontWeight: '700', fontSize: 12, marginTop: 3 },
  bookButton: { backgroundColor: UI.primary, height: 54, minWidth: 166, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: UI.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 9 },
  bookButtonText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
