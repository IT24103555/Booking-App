import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, ScrollView, View, Text, StyleSheet } from 'react-native';
import { userApi } from '../../api/userApi';
import { getErrorMessage } from '../../api/apiClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import { confirmDialog } from '../../components/ConfirmDialog';
import { AuthContext } from '../../context/AuthContext';
function InfoRow({ label, value }) { return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value || '-'}</Text></View>; }
function StatusPill({ active }) { return <View style={[styles.statusPill, active ? styles.activePill : styles.inactivePill]}><Text style={[styles.statusText, active ? styles.activeText : styles.inactiveText]}>{active ? 'Active' : 'Inactive'}</Text></View>; }
export default function UserDetailsScreen({ route, navigation }) {
  const { user: currentUser } = useContext(AuthContext);
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async ({ silent = false } = {}) => {
    try {
      setError('');
      if (!silent) setLoading(true);
      const res = await userApi.getById(id);
      setItem(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      load({ silent: true });
    }, [id])
  );
  const initials = useMemo(() => { const source = item?.name || item?.email || 'U'; return source.split(' ').filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join(''); }, [item]);
  const isOwnAccount = Boolean(currentUser?._id && item?._id && String(currentUser._id) === String(item._id));
  const isAdminAccount = item?.role === 'admin';
  const canManageStatus = item && !isOwnAccount && !isAdminAccount && ['customer', 'organizer'].includes(item.role);
  const canDelete = item && !isOwnAccount && !isAdminAccount && ['customer', 'organizer'].includes(item.role);

  const toggleStatus = () => {
    if (!item) return;
    const nextActive = !item.isActive;
    confirmDialog({
      title: nextActive ? 'Activate user?' : 'Deactivate user?',
      message: nextActive
        ? 'This will restore the user account.'
        : 'This will disable the user account from signing in.',
      confirmText: nextActive ? 'Activate' : 'Deactivate',
      onConfirm: async () => {
        try {
          await userApi.updateUserStatus(id, nextActive);
          Alert.alert('Success', `User ${nextActive ? 'activated' : 'deactivated'}`);
          load();
        } catch (e) {
          Alert.alert('Error', getErrorMessage(e));
        }
      },
    });
  };

  const onDelete = () => confirmDialog({ title: 'Delete user?', message: 'This action cannot be undone.', confirmText: 'Delete', onConfirm: async () => { try { await userApi.deleteUser(id); Alert.alert('Success', 'User deleted'); navigation.goBack(); } catch (e) { Alert.alert('Error', getErrorMessage(e)); } } });
  if (loading) return <LoadingSpinner />;
  return <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}><ErrorMessage message={error} />{item ? <View style={styles.content}><View style={styles.heroCard}><View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View><View style={styles.heroCopy}><View style={styles.heroTop}><Text style={styles.kicker}>User profile</Text><StatusPill active={Boolean(item.isActive)} /></View><Text style={styles.title}>{item.name || 'Unnamed user'}</Text><Text style={styles.subtitle}>{item.email}</Text></View></View><View style={styles.noticeCard}><Text style={styles.noticeTitle}>Personal profile details can only be updated by the account owner.</Text><Text style={styles.noticeText}>{isOwnAccount ? 'You cannot manage your own account from this screen. Use Profile settings instead.' : isAdminAccount ? 'Admin accounts are protected from modification or deletion.' : 'Use the actions below to manage account status when allowed.'}</Text></View><View style={styles.roleCard}><Text style={styles.roleLabel}>Access role</Text><Text style={styles.roleValue}>{item.role || 'customer'}</Text></View><AppCard><Text style={styles.sectionTitle}>Account information</Text><InfoRow label="Name" value={item.name} /><InfoRow label="Email" value={item.email} /><InfoRow label="Phone" value={item.phone} /><InfoRow label="Role" value={item.role} /><InfoRow label="Active" value={String(item.isActive)} /></AppCard>{canManageStatus || canDelete ? <View style={styles.actions}>{canManageStatus ? <AppButton title={item.isActive ? 'Deactivate User' : 'Activate User'} variant={item.isActive ? 'danger' : 'primary'} onPress={toggleStatus} /> : null}{canDelete ? <AppButton title="Delete User" variant="danger" onPress={onDelete} /> : null}</View> : null}</View> : <EmptyState title="User not found" actionTitle="Reload" onAction={load} />}</ScrollView>;
}
const styles = StyleSheet.create({ page: { flexGrow: 1, padding: 20, backgroundColor: '#FFF7FB', paddingBottom: 34 }, content: { width: '100%', alignSelf: 'center' }, heroCard: { backgroundColor: '#6C5CE7', borderRadius: 32, padding: 22, marginBottom: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 8 }, avatar: { width: 74, height: 74, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }, avatarText: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' }, heroCopy: { flex: 1 }, heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, kicker: { color: '#EDE9FE', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' }, title: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 8 }, subtitle: { color: '#F4F1FF', fontSize: 13, fontWeight: '700', marginTop: 4 }, statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }, activePill: { backgroundColor: '#DCFCE7' }, inactivePill: { backgroundColor: '#FEE2E2' }, statusText: { fontSize: 10, fontWeight: '900' }, activeText: { color: '#047857' }, inactiveText: { color: '#B91C1C' }, noticeCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#FCE1EE' }, noticeTitle: { color: '#1F1D2B', fontSize: 15, fontWeight: '900' }, noticeText: { color: '#7A7185', fontSize: 13, fontWeight: '600', lineHeight: 19, marginTop: 6 }, roleCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#FCE1EE', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, roleLabel: { color: '#8B7E93', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }, roleValue: { color: '#F80678', fontSize: 18, fontWeight: '900', textTransform: 'capitalize' }, sectionTitle: { color: '#1F1D2B', fontSize: 18, fontWeight: '900', marginBottom: 12 }, infoRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1EAF3' }, infoLabel: { color: '#8B7E93', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }, infoValue: { color: '#1F1D2B', fontSize: 15, fontWeight: '700', marginTop: 4 }, actions: { marginTop: 18 } });
