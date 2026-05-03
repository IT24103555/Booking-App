import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { notificationApi } from '../../api/notificationApi';
import { getErrorMessage } from '../../api/apiClient';
import { colors } from '../../constants/colors';

const ICONS = {
  booking: '🎟️',
  event: '🗓️',
  ticket: '🎫',
  venue: '📍',
  session: '🎤',
  profile: '👤',
  system: '🔔',
};

const TYPE_LABELS = {
  booking: 'Booking',
  event: 'Event',
  ticket: 'Ticket',
  venue: 'Venue',
  session: 'Session',
  profile: 'Profile',
  system: 'System',
};

const formatTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

function NotificationCard({ item, onPress, onDelete }) {
  const icon = ICONS[item.type] || ICONS.system;
  const isUnread = !item.isRead;
  const isHigh = item.priority === 'high';

  return (
    <View style={[
      styles.card,
      isUnread ? styles.cardUnread : styles.cardRead,
      isHigh && styles.cardHigh,
    ]}>
      <Pressable onPress={onPress} style={styles.cardPressArea}>
        <View style={styles.cardTopRow}>
          <View style={styles.iconBox}><Text style={styles.iconText}>{icon}</Text></View>
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {isHigh ? <View style={styles.priorityBadge}><Text style={styles.priorityText}>High</Text></View> : null}
            </View>
            <Text style={styles.cardType}>{TYPE_LABELS[item.type] || 'System'}</Text>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardTime}>{formatTimestamp(item.createdAt)}</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.cardActions}>
        {!item.isRead ? <View style={styles.unreadDot} /> : <View />}
        <TouchableOpacity activeOpacity={0.82} onPress={onDelete} style={styles.deleteButton} accessibilityRole="button" accessibilityLabel="Delete notification">
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.deleteLabel}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function NotificationScreen() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      setError('');
      isRefresh ? setRefreshing(true) : setLoading(true);
      const [listRes, countRes] = await Promise.all([
        notificationApi.getMyNotifications(),
        notificationApi.getUnreadCount(),
      ]);
      setItems(listRes?.data || []);
      setUnreadCount(Number(countRes?.data?.count || 0));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const unreadLabel = useMemo(() => `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`, [unreadCount]);

  const markAsRead = async (id) => {
    const target = items.find((item) => item._id === id);
    if (!target || target.isRead) return;

    try {
      setError('');
      await notificationApi.markNotificationAsRead(id);
      setItems((current) => current.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Delete notification',
      'Do you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await notificationApi.deleteNotification(item._id);
              if (!item.isRead) setUnreadCount((current) => Math.max(0, current - 1));
              setItems((current) => current.filter((entry) => entry._id !== item._id));
            } catch (err) {
              setError(getErrorMessage(err));
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const markAllRead = async () => {
    try {
      setError('');
      setSaving(true);
      await notificationApi.markAllNotificationsAsRead();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.page}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => loadNotifications(true)}
          ListHeaderComponent={(
            <View style={styles.headerCard}>
              <Text style={styles.kicker}>In-app alerts</Text>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>{unreadLabel}</Text>
              <View style={styles.actionRow}>
                <AppButton
                  title={saving ? 'Updating...' : 'Mark all as read'}
                  onPress={markAllRead}
                  disabled={saving || unreadCount === 0}
                />
              </View>
              <ErrorMessage message={error} />
            </View>
          )}
          ListEmptyComponent={<EmptyState title="No notifications yet" description="You will see booking, event, and system alerts here." />}
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              onPress={() => markAsRead(item._id)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  page: { padding: 18, paddingBottom: 34 },
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  kicker: { color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 6 },
  subtitle: { color: 'rgba(255,255,255,0.88)', fontWeight: '700', marginTop: 8 },
  actionRow: { marginTop: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#9D174D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  cardUnread: { backgroundColor: '#FFF7FC' },
  cardRead: { opacity: 0.82 },
  cardHigh: { borderColor: '#FECACA' },
  cardPressArea: { flex: 1 },
  cardTopRow: { flexDirection: 'row' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FFF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 20 },
  cardContent: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '900' },
  priorityBadge: { backgroundColor: '#FEE2E2', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  priorityText: { color: '#B91C1C', fontSize: 10, fontWeight: '900' },
  cardType: { color: colors.primary, fontSize: 11, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },
  cardMessage: { color: colors.muted, fontSize: 13, fontWeight: '600', lineHeight: 18, marginTop: 6 },
  cardTime: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 8 },
  cardActions: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 6 },
  deleteIcon: { fontSize: 16 },
  deleteLabel: { color: colors.muted, fontSize: 11, fontWeight: '800' },
});