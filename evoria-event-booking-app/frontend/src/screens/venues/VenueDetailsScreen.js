import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Image, ScrollView, View, Text, StyleSheet } from 'react-native';
import { venueApi } from '../../api/venueApi';
import { getErrorMessage } from '../../api/apiClient';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { confirmDialog } from '../../components/ConfirmDialog';
import { API_BASE_URL } from '../../config/apiConfig';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';

const imageUrl = (image) => {
  if (!image) return null;
  if (String(image).startsWith('http')) return image;
  return encodeURI(`${UPLOADS_BASE}${image}`);
};

function InfoRow({ label, value }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value || '-'}</Text></View>;
}

function StatusPill({ status }) {
  const available = status === 'Available';
  return <View style={[styles.statusPill, available ? styles.availablePill : styles.unavailablePill]}><Text style={[styles.statusText, available ? styles.availableText : styles.unavailableText]}>{status || 'Unknown'}</Text></View>;
}

export default function VenueDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async ({ silent = false } = {}) => {
    try {
      setError('');
      if (!silent) setLoading(true);
      const res = await venueApi.getById(id);
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

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      load({ silent: true });
    }, [id])
  );

  const onDelete = () =>
    confirmDialog({
      title: 'Delete venue?',
      message: 'Are you sure you want to delete this venue?',
      onConfirm: async () => {
        try {
          await venueApi.remove(id);
          Alert.alert('Success', 'Venue deleted');
          navigation.goBack();
        } catch (e) {
          Alert.alert('Error', getErrorMessage(e));
        }
      },
    });

  if (loading) return <LoadingSpinner />;

  const uri = imageUrl(item?.image);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <ErrorMessage message={error} />
      {item ? (
        <View style={styles.content}>
          <View style={styles.heroCard}>
            {uri ? <Image source={{ uri }} style={styles.heroImage} /> : <View style={styles.heroPlaceholder}><Text style={styles.heroIcon}>🏛️</Text></View>}
            <View style={styles.heroOverlay}>
              <View style={styles.heroCopy}>
                <Text style={styles.kicker}>Venue profile</Text>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.location}</Text>
              </View>
              <StatusPill status={item.status} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}><Text style={styles.statValue}>{item.capacity}</Text><Text style={styles.statLabel}>Capacity</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{item.status}</Text><Text style={styles.statLabel}>Status</Text></View>
          </View>

          <AppCard>
            <Text style={styles.sectionTitle}>Venue information</Text>
            <InfoRow label="Location" value={item.location} />
            <InfoRow label="Capacity" value={String(item.capacity)} />
            <InfoRow label="Status" value={item.status} />
            <InfoRow label="Description" value={item.description} />
          </AppCard>

          <View style={styles.actions}>
            <AppButton title="Edit Venue" onPress={() => navigation.navigate('EditVenue', { id })} />
            <AppButton title="Delete Venue" variant="danger" onPress={onDelete} />
          </View>
        </View>
      ) : (
        <EmptyState title="Venue not found" actionTitle="Reload" onAction={load} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 20, backgroundColor: '#FFF7FB', paddingBottom: 34 },
  content: { width: '100%', alignSelf: 'center' },
  heroCard: { height: 260, borderRadius: 32, overflow: 'hidden', backgroundColor: '#6C5CE7', marginBottom: 14, shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 8 },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroIcon: { fontSize: 58 },
  heroOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, backgroundColor: 'rgba(31,29,43,0.35)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroCopy: { flex: 1, marginRight: 10 },
  kicker: { color: '#EDE9FE', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 5 },
  subtitle: { color: '#F4F1FF', fontSize: 14, marginTop: 6 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  availablePill: { backgroundColor: '#DCFCE7' },
  unavailablePill: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 10, fontWeight: '900' },
  availableText: { color: '#047857' },
  unavailableText: { color: '#B91C1C' },
  statsRow: { flexDirection: 'row', marginHorizontal: -5, marginBottom: 14 },
  statCard: { flex: 1, marginHorizontal: 5, backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#FCE1EE', alignItems: 'center' },
  statValue: { color: '#1F1D2B', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#8B7E93', fontSize: 12, fontWeight: '800', marginTop: 3 },
  sectionTitle: { color: '#1F1D2B', fontSize: 18, fontWeight: '900', marginBottom: 12 },
  infoRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1EAF3' },
  infoLabel: { color: '#8B7E93', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  infoValue: { color: '#1F1D2B', fontSize: 15, fontWeight: '700', marginTop: 4 },
  actions: { marginTop: 18 },
});