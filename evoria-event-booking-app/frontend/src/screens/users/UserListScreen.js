import React, { useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, TouchableOpacity, View, Text, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { userApi } from '../../api/userApi';
import { getErrorMessage } from '../../api/apiClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

function StatusPill({ active }) { return <View style={[styles.statusPill, active ? styles.activePill : styles.inactivePill]}><Text style={[styles.statusText, active ? styles.activeText : styles.inactiveText]}>{active ? 'Active' : 'Inactive'}</Text></View>; }
function getInitials(name, email) { const source = name || email || 'U'; return source.split(' ').filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join(''); }

export default function UserListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async (isRefresh = false) => {
    try {
      setError('');
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await userApi.getAll();
      setItems(res.data || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (items.length > 0) {
        load(true); // Silently refresh
      }
    }, [])
  );
  const filteredItems = useMemo(() => { const value = search.trim().toLowerCase(); if (!value) return items; return items.filter((item) => `${item.name || ''} ${item.email || ''} ${item.role || ''} ${String(item.isActive)}`.toLowerCase().includes(value)); }, [items, search]);
  const counts = useMemo(() => items.reduce((acc, item) => ({ total: acc.total + 1, active: acc.active + (item.isActive ? 1 : 0), admins: acc.admins + (item.role === 'admin' ? 1 : 0) }), { total: 0, active: 0, admins: 0 }), [items]);
  if (loading) return <LoadingSpinner />;
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}><Text style={styles.kicker}>Administration</Text><Text style={styles.pageTitle}>Users</Text><Text style={styles.pageSubtitle}>Review profiles, roles, and account status from a focused admin view.</Text><View style={styles.statsRow}><View style={styles.statCard}><Text style={styles.statValue}>{counts.total}</Text><Text style={styles.statLabel}>Users</Text></View><View style={styles.statCard}><Text style={styles.statValue}>{counts.active}</Text><Text style={styles.statLabel}>Active</Text></View><View style={styles.statCard}><Text style={styles.statValue}>{counts.admins}</Text><Text style={styles.statLabel}>Admins</Text></View></View></View>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search by name, email, role, or status" placeholderTextColor="#9A8EA4" style={styles.searchInput} />
      <ErrorMessage message={error} />
      {filteredItems.length === 0 ? <EmptyState title={items.length === 0 ? 'No users found' : 'No matching users'} actionTitle="Reload" onAction={load} /> : <FlatList data={filteredItems} keyExtractor={(item) => item._id} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#6C5CE7" />} renderItem={({ item }) => <TouchableOpacity activeOpacity={0.86} onPress={() => navigation.navigate('UserDetails', { id: item._id })} style={styles.card}><View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(item.name, item.email)}</Text></View><View style={styles.userCopy}><Text style={styles.title}>{item.name || 'Unnamed user'}</Text><Text style={styles.subtitle}>{item.email}</Text><Text style={styles.meta}>Role: {(item.role || 'customer').toUpperCase()}</Text></View><StatusPill active={Boolean(item.isActive)} /></TouchableOpacity>} />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7FB', padding: 20 }, heroCard: { backgroundColor: '#6C5CE7', borderRadius: 32, padding: 22, marginBottom: 16, shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 8 }, kicker: { color: '#EDE9FE', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' }, pageTitle: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', marginTop: 6 }, pageSubtitle: { color: '#F4F1FF', fontSize: 14, lineHeight: 21, marginTop: 8 }, statsRow: { flexDirection: 'row', marginTop: 18 }, statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 18, padding: 12, marginRight: 8 }, statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' }, statLabel: { color: '#EDE9FE', fontSize: 11, fontWeight: '800', marginTop: 2 }, searchInput: { height: 52, backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16, marginBottom: 12, color: '#1F1D2B', borderWidth: 1, borderColor: '#FCE1EE', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 }, listContent: { paddingBottom: 28 }, card: { backgroundColor: '#FFFFFF', borderRadius: 26, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#FCE1EE', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 4 }, avatar: { width: 54, height: 54, borderRadius: 20, backgroundColor: '#F80678', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' }, userCopy: { flex: 1 }, title: { color: '#1F1D2B', fontSize: 16, fontWeight: '900' }, subtitle: { color: '#7A7185', fontSize: 13, fontWeight: '700', marginTop: 3 }, meta: { color: '#8B7E93', fontSize: 11, fontWeight: '900', marginTop: 4 }, statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }, activePill: { backgroundColor: '#DCFCE7' }, inactivePill: { backgroundColor: '#FEE2E2' }, statusText: { fontSize: 10, fontWeight: '900' }, activeText: { color: '#047857' }, inactiveText: { color: '#B91C1C' },
});
