import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView } from 'react-native';
import { ticketTypeApi } from '../../api/ticketTypeApi';
import { getErrorMessage } from '../../api/apiClient';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { confirmDialog } from '../../components/ConfirmDialog';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatCurrency';

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );
}

export default function TicketTypeDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await ticketTypeApi.getById(id);
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
      title: 'Delete ticket type?',
      message: 'Are you sure you want to delete this ticket type?',
      onConfirm: async () => {
        try {
          await ticketTypeApi.remove(id);
          Alert.alert('Success', 'Ticket type deleted');
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
              <Text style={styles.kicker}>Ticket type</Text>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.price}>{formatCurrency(item.price)}</Text>
            </View>

            <View style={styles.inventoryRow}>
              <View style={styles.inventoryCard}>
                <Text style={styles.inventoryValue}>{item.totalQuantity}</Text>
                <Text style={styles.inventoryLabel}>Total</Text>
              </View>
              <View style={styles.inventoryCard}>
                <Text style={styles.inventoryValue}>{item.availableQuantity}</Text>
                <Text style={styles.inventoryLabel}>Available</Text>
              </View>
              <View style={styles.inventoryCard}>
                <Text style={styles.inventoryValue}>{item.status}</Text>
                <Text style={styles.inventoryLabel}>Status</Text>
              </View>
            </View>

            <AppCard>
              <Text style={styles.sectionTitle}>Details</Text>
              <DetailRow label="Event" value={item.eventId?.title || 'Event not assigned'} />
              <DetailRow label="Description" value={item.description || 'No description provided.'} />
              <DetailRow label="Price" value={formatCurrency(item.price)} />
              <DetailRow label="Total Quantity" value={String(item.totalQuantity)} />
              <DetailRow label="Available Quantity" value={String(item.availableQuantity)} />
              <DetailRow label="Status" value={item.status} />
            </AppCard>

            <View style={styles.actionPanel}>
              <AppButton title="Edit ticket type" onPress={() => navigation.navigate('EditTicketType', { id })} />
              <AppButton title="Delete ticket type" variant="danger" onPress={onDelete} />
            </View>
          </>
        ) : (
          <EmptyState title="Ticket type not found" actionTitle="Reload" onAction={load} />
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
  price: { color: '#fff', opacity: 0.9, fontSize: 20, fontWeight: '900', marginTop: 10 },
  inventoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  inventoryCard: { flex: 1, minWidth: 130, backgroundColor: colors.card, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: colors.border },
  inventoryValue: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  inventoryLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 18, marginBottom: 12 },
  detailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.muted, fontWeight: '800', marginBottom: 5, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  detailValue: { color: colors.text, fontWeight: '700', lineHeight: 21 },
  actionPanel: { marginTop: 14, gap: 10 },
});
