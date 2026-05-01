import React, { useContext, useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView } from 'react-native';
import { bookingApi } from '../../api/bookingApi';
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

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );
}

export default function BookingDetailsScreen({ route, navigation }) {
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
      const res = await bookingApi.getById(id);
      setItem(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onConfirm = async () => {
    if (!window.confirm('Confirm booking? This will update the booking status to Confirmed.')) return;
    try {
      await bookingApi.confirm(id);
      Alert.alert('Success', 'Booking confirmed');
      await load();
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  };

  const onCancel = async () => {
    const title = isStaff ? 'Cancel this booking?' : 'Cancel your booking?';
    const message = 'This will mark the booking as Cancelled and restore tickets to inventory.';
    if (!window.confirm(`${title}\n\n${message}`)) return;
    try {
      await bookingApi.cancel(id);
      Alert.alert('Success', 'Booking cancelled');
      await load();
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Confirmed') return '#10b981'; // green
    if (status === 'Cancelled') return '#ef4444'; // red
    return '#f59e0b'; // yellow/amber for Pending
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.shell}>
        <ErrorMessage message={error} />
        {item ? (
          <>
            <View style={styles.hero}>
              <Text style={styles.kicker}>Booking details</Text>
              <Text style={styles.title}>Booking #{String(item._id).slice(-6).toUpperCase()}</Text>
              <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) + '24', borderWidth: 1.5, borderColor: getStatusColor(item.status) }]}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(item.status), marginRight: 8 }} />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>
            </View>

            <AppCard>
              <Text style={styles.sectionTitle}>Reservation summary</Text>
              <DetailRow label="Event" value={item.eventId?.title || item.eventId} />
              <DetailRow label="Ticket Type" value={item.ticketTypeId?.name || item.ticketTypeId} />
              <DetailRow label="Quantity" value={String(item.quantity)} />
              <DetailRow label="Created" value={formatDate(item.createdAt)} />
              <DetailRow label="Booking ID" value={item._id} />
            </AppCard>

            <View style={styles.actionPanel}>
              {isStaff && (
                <>
                  {item.status !== 'Confirmed' && item.status !== 'Cancelled' && (
                    <AppButton title="✓ Confirm Booking" onPress={onConfirm} />
                  )}
                  {item.status !== 'Cancelled' && (
                    <AppButton title="✕ Cancel Booking" variant="danger" onPress={onCancel} />
                  )}
                  {item.status === 'Cancelled' && (
                    <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 8 }}>Booking cancelled</Text>
                  )}
                </>
              )}
              {!isStaff && item.status !== 'Cancelled' && (
                <AppButton title="Cancel My Booking" variant="danger" onPress={onCancel} />
              )}
              {!isStaff && item.status === 'Cancelled' && (
                <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 12 }}>Your booking has been cancelled</Text>
              )}
            </View>
          </>
        ) : (
          <EmptyState title="Booking not found" actionTitle="Reload" onAction={load} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  shell: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  hero: { backgroundColor: colors.primary, borderRadius: 30, padding: 24, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 14 }, elevation: 4 },
  kicker: { color: '#fff', opacity: 0.82, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 7, letterSpacing: -0.4 },
  statusPill: { alignSelf: 'flex-start', marginTop: 14, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
  statusText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 18, marginBottom: 12 },
  detailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.muted, fontWeight: '800', marginBottom: 5, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  detailValue: { color: colors.text, fontWeight: '700', lineHeight: 21 },
  actionPanel: { marginTop: 14, gap: 10 },
});
