import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, View, Text, StyleSheet } from 'react-native';
import { venueApi } from '../../api/venueApi';
import { getErrorMessage } from '../../api/apiClient';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { confirmDialog } from '../../components/ConfirmDialog';
import { colors } from '../../constants/colors';

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

function StatusPill({ status }) {
  const available = status === 'Available';
  return (
    <View style={[styles.statusPill, available ? styles.availablePill : styles.unavailablePill]}>
      <Text style={[styles.statusText, available ? styles.availableText : styles.unavailableText]}>
        {status || 'Unknown'}
      </Text>
    </View>
  );
}

export default function VenueDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setLoading(true);
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

  const onDelete = () => {
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
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <ErrorMessage message={error} />

      {item ? (
        <View style={styles.content}>
          <View style={styles.heroCard}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.heroImage} />
            ) : (
              <View style={styles.heroPlaceholder}>
                <Text style={styles.heroIcon}>🏛️</Text>
              </View>
            )}

            <View style={styles.heroOverlay}>
              <View style={styles.heroCopy}>
                <Text style={styles.kicker}>Venue profile</Text>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.location}</Text>
              </View>
              <StatusPill status={item.status} />
            </View>
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
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  content: { maxWidth: 760, width: '100%', alignSelf: 'center' },
  heroCard: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
  },
  heroImage: { width: '100%', height: 250 },
  heroPlaceholder: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  heroIcon: { fontSize: 48 },
  heroOverlay: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroCopy: { flex: 1 },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { color: colors.muted, marginTop: 6, fontSize: 15 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { color: colors.muted, fontWeight: '700' },
  infoValue: { color: colors.text, fontWeight: '800', flex: 1, textAlign: 'right' },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  availablePill: { backgroundColor: '#DCFCE7' },
  unavailablePill: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '900' },
  availableText: { color: '#166534' },
  unavailableText: { color: '#991B1B' },
  actions: { marginTop: 8, marginBottom: 20 },
});
