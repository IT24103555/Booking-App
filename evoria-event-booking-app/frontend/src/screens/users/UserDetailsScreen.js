import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View, Text, StyleSheet } from 'react-native';
import { userApi } from '../../api/userApi';
import { getErrorMessage } from '../../api/apiClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
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

function StatusPill({ active }) {
  return (
    <View style={[styles.statusPill, active ? styles.activePill : styles.inactivePill]}>
      <Text style={[styles.statusText, active ? styles.activeText : styles.inactiveText]}>
        {active ? 'Active' : 'Inactive'}
      </Text>
    </View>
  );
}

export default function UserDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await userApi.getById(id);
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

  const initials = useMemo(() => {
    const source = item?.name || item?.email || 'U';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }, [item]);

  const onDelete = () => {
    confirmDialog({
      title: 'Delete user?',
      message: 'This action cannot be undone.',
      onConfirm: async () => {
        try {
          await userApi.remove(id);
          Alert.alert('Success', 'User deleted');
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
          <AppCard>
            <View style={styles.profileTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.kicker}>User profile</Text>
                <Text style={styles.title}>{item.name || 'Unnamed user'}</Text>
                <Text style={styles.subtitle}>{item.email}</Text>
              </View>
              <StatusPill active={Boolean(item.isActive)} />
            </View>

            <View style={styles.roleCard}>
              <Text style={styles.roleLabel}>Role</Text>
              <Text style={styles.roleValue}>{item.role || 'customer'}</Text>
            </View>
          </AppCard>

          <AppCard>
            <Text style={styles.sectionTitle}>Account information</Text>
            <InfoRow label="Name" value={item.name} />
            <InfoRow label="Email" value={item.email} />
            <InfoRow label="Phone" value={item.phone} />
            <InfoRow label="Role" value={item.role} />
            <InfoRow label="Active" value={String(item.isActive)} />
          </AppCard>

          <View style={styles.actions}>
            <AppButton title="Edit User" onPress={() => navigation.navigate('EditUser', { id })} />
            <AppButton title="Delete User" variant="danger" onPress={onDelete} />
          </View>
        </View>
      ) : (
        <EmptyState title="User not found" actionTitle="Reload" onAction={load} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  content: { maxWidth: 720, width: '100%', alignSelf: 'center' },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  avatarText: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  profileCopy: { flex: 1 },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: colors.muted, marginTop: 4 },
  roleCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  roleValue: { marginTop: 6, color: colors.text, fontSize: 20, fontWeight: '900', textTransform: 'capitalize' },
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
  activePill: { backgroundColor: '#DCFCE7' },
  inactivePill: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '900' },
  activeText: { color: '#166534' },
  inactiveText: { color: '#991B1B' },
  actions: { marginTop: 8, marginBottom: 20 },
});
