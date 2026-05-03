import React, { useContext, useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, Platform, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { bookingApi } from '../../api/bookingApi';
import { getErrorMessage } from '../../api/apiClient';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { confirmDialog } from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';
import { AuthContext } from '../../context/AuthContext';
import { downloadBookingReceipt } from '../../utils/bookingReceipt';
import { API_BASE_URL } from '../../config/apiConfig';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';
const UI = { primary: '#EC168C', purple: '#7C3AED', background: '#FFF7FC', surface: '#FFFFFF', text: '#111827', muted: '#7C7C8A', border: '#F0DDEB', softPink: '#FFE7F4' };
const imageUrl = (image) => !image ? null : String(image).startsWith('http') ? image : encodeURI(`${UPLOADS_BASE}${image}`);

function getStatusColor(status) {
  if (status === 'Confirmed') return '#10B981';
  if (status === 'Cancelled') return '#EF4444';
  return '#F59E0B';
}

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

  useEffect(() => { load(); }, [id]);

  const onConfirm = () => {
    confirmDialog({
      title: 'Confirm booking?',
      message: 'This will update the booking status to Confirmed.',
      onConfirm: async () => {
        try {
          await bookingApi.confirm(id);
          Alert.alert('Success', 'Booking confirmed');
          await load();
        } catch (e) {
          Alert.alert('Error', getErrorMessage(e));
        }
      },
    });
  };

  const onCancel = () => {
    confirmDialog({
      title: isStaff ? 'Cancel this booking?' : 'Cancel your booking?',
      message: 'This will mark the booking as Cancelled and restore tickets to inventory.',
      onConfirm: async () => {
        try {
          await bookingApi.cancel(id);
          Alert.alert('Success', 'Booking cancelled');
          await load();
        } catch (e) {
          Alert.alert('Error', getErrorMessage(e));
        }
      },
    });
  };

  const onDownloadReceipt = () => {
    const downloaded = downloadBookingReceipt(item);
    if (!downloaded) {
      Alert.alert('Receipt unavailable', Platform.OS === 'web' ? 'The receipt could not be generated.' : 'Receipt download is currently supported on web only.');
    }
  };

  if (loading) return <LoadingSpinner />;
  const statusColor = getStatusColor(item?.status);
  const uri = imageUrl(item?.eventId?.image);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <ErrorMessage message={error} />
          {item ? (
            <>
              <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backText}>‹</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>Booking Details</Text>
                <View style={styles.backPlaceholder} />
              </View>

              <View style={styles.statusRow}>
                <View style={[styles.statusPill, { backgroundColor: `${statusColor}22`, borderColor: `${statusColor}66` }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                </View>
                <Text style={styles.bookingId}>Booking ID: #EVR{String(item._id).slice(-6).toUpperCase()}</Text>
              </View>

              <View style={styles.eventCard}>
                {uri ? <Image source={{ uri }} style={styles.eventImage} /> : <View style={[styles.eventImage, styles.placeholder]}><Text style={styles.placeholderIcon}>🎫</Text></View>}
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{item.eventId?.title || 'Event not loaded'}</Text>
                  <Text style={styles.eventMeta}>{formatDate(item.eventId?.eventDate)}</Text>
                  <Text style={styles.eventMeta}>{item.eventId?.venueId?.name || 'Venue TBA'}</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Booking Info</Text>
                <DetailRow label="Ticket Type" value={item.ticketTypeId?.name || item.ticketTypeId || 'General Entry'} />
                <DetailRow label="Quantity" value={`${item.quantity || 0} Ticket${Number(item.quantity) === 1 ? '' : 's'}`} />
                <DetailRow label="Total Amount" value={`LKR ${Number(item.totalAmount || 0).toFixed(0)}`} />
                <DetailRow label="Booking Date" value={formatDate(item.bookingDate || item.createdAt)} />
                <DetailRow label="Payment Method" value={item.paymentMethod || 'Pay at Venue'} />
                {isStaff ? <DetailRow label="Customer" value={item.userId?.name || item.userId?.email || item.userId} /> : null}
              </View>

              <View style={styles.actionStack}>
                <AppButton title="Download Ticket" onPress={onDownloadReceipt} />
                {isStaff && item.status === 'Pending' ? <AppButton title="Confirm Booking" onPress={onConfirm} /> : null}
                {item.status !== 'Cancelled' ? <AppButton title="Cancel Booking" variant="danger" onPress={onCancel} /> : null}
              </View>
            </>
          ) : (
            <EmptyState title="Booking not found" actionTitle="Go back" onAction={() => navigation.goBack()} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background },
  screen: { flex: 1, backgroundColor: UI.background },
  page: { padding: 18, paddingBottom: 42 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: UI.border },
  backText: { color: UI.text, fontSize: 28, lineHeight: 28, fontWeight: '900' },
  backPlaceholder: { width: 40, height: 40 },
  headerTitle: { color: UI.text, fontWeight: '900', fontSize: 17 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  statusPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  statusText: { fontSize: 12, fontWeight: '900' },
  bookingId: { flex: 1, textAlign: 'right', color: UI.text, fontSize: 12, fontWeight: '800' },
  eventCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, padding: 12, borderWidth: 1, borderColor: UI.border, shadowColor: '#9D174D', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 6 },
  eventImage: { width: 96, height: 96, borderRadius: 18, backgroundColor: UI.softPink },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 27 },
  eventInfo: { flex: 1, paddingLeft: 13, justifyContent: 'center' },
  eventTitle: { color: UI.text, fontSize: 16, fontWeight: '900', lineHeight: 21 },
  eventMeta: { color: UI.muted, fontSize: 12, fontWeight: '700', marginTop: 6 },
  infoCard: { backgroundColor: '#fff', borderRadius: 24, padding: 18, marginTop: 16, borderWidth: 1, borderColor: UI.border },
  sectionTitle: { color: UI.text, fontSize: 17, fontWeight: '900', marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F7E8F2' },
  detailLabel: { color: UI.muted, fontSize: 13, fontWeight: '800' },
  detailValue: { flex: 1, textAlign: 'right', color: UI.text, fontSize: 13, fontWeight: '900', marginLeft: 10 },
  actionStack: { gap: 12, marginTop: 18 },
});
