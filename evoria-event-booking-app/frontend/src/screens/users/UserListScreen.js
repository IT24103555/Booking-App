import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View, Text, TextInput, StyleSheet } from 'react-native';
import { userApi } from '../../api/userApi';
import { getErrorMessage } from '../../api/apiClient';
import AppCard from '../../components/AppCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';

function StatusPill({ active }) {
  return (
    <View style={[styles.statusPill, active ? styles.activePill : styles.inactivePill]}>
      <Text style={[styles.statusText, active ? styles.activeText : styles.inactiveText]}>
        {active ? 'Active' : 'Inactive'}
      </Text>
    </View>
  );
}

function getInitials(name, email) {
  const source = name || email || 'U';
  return source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function UserListScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await userApi.getAll();
      setItems(res.data || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return items;

    return items.filter((item) => {
      const searchable = `${item.name || ''} ${item.email || ''} ${item.role || ''} ${String(item.isActive)}`.toLowerCase();
      return searchable.includes(value);
    });
  }, [items, search]);

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        total: acc.total + 1,
        active: acc.active + (item.isActive ? 1 : 0),
        admins: acc.admins + (item.role === 'admin' ? 1 : 0),
      }),
      { total: 0, active: 0, admins: 0 }
    );
  }, [items]);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Administration</Text>
        <Text style={styles.pageTitle}>Users</Text>
        <Text style={styles.pageSubtitle}>Review profiles, roles, and account status from a focused admin view.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{counts.total}</Text>
          <Text style={styles.statLabel}>Total users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{counts.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{counts.admins}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name, email, role, or status"
        placeholderTextColor={colors.muted}
        style={styles.searchInput}
      />

      <ErrorMessage message={error} />

      {filteredItems.length === 0 ? (
        <EmptyState title={items.length === 0 ? 'No users found' : 'No matching users'} actionTitle="Reload" onAction={load} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.86} onPress={() => navigation.navigate('UserDetails', { id: item._id })}>
              <AppCard>
                <View style={styles.userCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(item.name, item.email)}</Text>
                  </View>
                  <View style={styles.userCopy}>
                    <Text style={styles.title}>{item.name || 'Unnamed user'}</Text>
                    <Text style={styles.subtitle}>{item.email}</Text>
                    <Text style={styles.meta}>Role: {(item.role || 'customer').toUpperCase()}</Text>
                  </View>
                  <StatusPill active={Boolean(item.isActive)} />
                </View>
              </AppCard>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  header: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 16,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  pageTitle: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  pageSubtitle: { marginTop: 8, color: colors.muted, maxWidth: 720, fontSize: 15, lineHeight: 22 },
  statsRow: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  statValue: { color: colors.text, fontSize: 24, fontWeight: '900' },
  statLabel: { color: colors.muted, marginTop: 4, fontSize: 12, fontWeight: '700' },
  searchInput: {
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.text,
    marginBottom: 12,
    fontSize: 14,
  },
  listContent: { maxWidth: 980, width: '100%', alignSelf: 'center', paddingBottom: 24 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontSize: 17, fontWeight: '900' },
  userCopy: { flex: 1 },
  title: { fontWeight: '900', color: colors.text, fontSize: 16 },
  subtitle: { marginTop: 4, color: colors.muted },
  meta: { marginTop: 6, color: colors.muted, fontSize: 12, fontWeight: '700' },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  activePill: { backgroundColor: '#DCFCE7' },
  inactivePill: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '900' },
  activeText: { color: '#166534' },
  inactiveText: { color: '#991B1B' },
});
