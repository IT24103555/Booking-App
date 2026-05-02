import React, { useContext, useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { eventApi } from '../../api/eventApi';
import { getErrorMessage } from '../../api/apiClient';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { confirmDialog } from '../../components/ConfirmDialog';
import { colors } from '../../constants/colors';
import { formatDate } from '../../utils/formatDate';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/apiConfig';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );
}

function StatusPill({ value }) {
  return (
    <View style={styles.statusPill}>
      <Text style={styles.statusText}>{value || 'Unknown'}</Text>
    </View>
  );
}

export default function EventDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useContext(AuthContext);
  const isStaff = user?.role === 'admin' || user?.role === 'organizer';

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await eventApi.getById(id);
      setItem(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

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

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.shell}>
        <ErrorMessage message={error} />
        {item ? (
          <>
            <View style={styles.hero}>
              <View style={styles.heroTopRow}>
                <Text style={styles.kicker}>Event details</Text>
                <StatusPill value={item.status} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{formatDate(item.eventDate)} · {item.startTime} - {item.endTime}</Text>
            </View>

            {item.image ? (
              <Image
                source={{ uri: encodeURI(`${UPLOADS_BASE}${item.image}`) }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            ) : null}

            <AppCard>
              <Text style={styles.sectionTitle}>Overview</Text>
              <DetailRow label="Venue" value={item.venueId?.name || '-'} />
              <DetailRow label="Date" value={formatDate(item.eventDate)} />
              <DetailRow label="Time" value={`${item.startTime || '-'} - ${item.endTime || '-'}`} />
              <DetailRow label="Description" value={item.description || 'No description provided.'} />
            </AppCard>

            <View style={styles.actionPanel}>
              {isStaff ? (
                <>
                  <AppButton title="Edit event" onPress={() => navigation.navigate('EditEvent', { id })} />
                  <AppButton title="Delete event" variant="danger" onPress={onDelete} />
                </>
              ) : (
                <AppButton title="Book tickets" onPress={() => navigation.navigate('CreateBooking', { eventId: id })} />
              )}
            </View>
          </>
        ) : (
          <EmptyState title="Event not found" actionTitle="Reload" onAction={load} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  shell: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  hero: { backgroundColor: colors.primary, borderRadius: 30, padding: 24, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 14 }, elevation: 4 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12 },
  kicker: { color: '#fff', opacity: 0.82, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 31, fontWeight: '900', lineHeight: 38, letterSpacing: -0.5 },
  subtitle: { color: '#fff', opacity: 0.86, marginTop: 10, fontSize: 15, fontWeight: '700' },
  statusPill: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  statusText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 18, marginBottom: 12 },
  eventImage: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    marginBottom: 14,
    backgroundColor: colors.primary,
  },
  detailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.muted, fontWeight: '800', marginBottom: 5, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  detailValue: { color: colors.text, fontWeight: '700', lineHeight: 21 },
  actionPanel: { marginTop: 14, gap: 10 },
});
