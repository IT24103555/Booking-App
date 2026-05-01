import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import AppButton from '../../components/AppButton';
import { AuthContext } from '../../context/AuthContext';

const MODULES = [
  { title: 'Users', description: 'Manage platform accounts and roles.', route: 'UserList' },
  { title: 'Ticket Types', description: 'Create pricing tiers and availability.', route: 'TicketTypeList' },
  { title: 'Venues', description: 'Maintain event locations and capacity.', route: 'VenueList' },
  { title: 'Events', description: 'Publish and manage upcoming events.', route: 'EventList' },
  { title: 'Bookings', description: 'Review reservations and booking status.', route: 'BookingList' },
  { title: 'Session Agendas', description: 'Organize sessions, speakers, and schedules.', route: 'SessionAgendaList' },
];

function ModuleCard({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.82} style={styles.moduleCard} onPress={onPress}>
      <View style={styles.moduleIcon}>
        <Text style={styles.moduleIconText}>{item.title.charAt(0)}</Text>
      </View>
      <View style={styles.moduleContent}>
        <Text style={styles.moduleTitle}>{item.title}</Text>
        <Text style={styles.moduleDescription}>{item.description}</Text>
      </View>
      <Text style={styles.moduleArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.shell}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Control center</Text>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Logged in as {user?.email || 'user'} · {user?.role || 'member'}</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>6</Text>
            <Text style={styles.summaryLabel}>Management modules</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{String(user?.role || 'User')}</Text>
            <Text style={styles.summaryLabel}>Current access level</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Manage platform</Text>
        <View style={styles.grid}>
          {MODULES.map((item) => (
            <ModuleCard key={item.route} item={item} onPress={() => navigation.navigate(item.route)} />
          ))}
        </View>

        <View style={styles.footerAction}>
          <AppButton title="Logout" variant="danger" onPress={logout} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  shell: { width: '100%', maxWidth: 980, alignSelf: 'center' },
  hero: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { marginTop: 6, fontSize: 36, fontWeight: '900', color: colors.text, letterSpacing: -0.6 },
  subtitle: { marginTop: 8, color: colors.muted, fontSize: 15, lineHeight: 22 },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
  summaryCard: {
    flexGrow: 1,
    flexBasis: 230,
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 18,
  },
  summaryValue: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  summaryLabel: { color: '#fff', opacity: 0.84, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 10 },
  grid: { gap: 12 },
  moduleCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  moduleIconText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  moduleContent: { flex: 1 },
  moduleTitle: { color: colors.text, fontWeight: '900', fontSize: 16, marginBottom: 4 },
  moduleDescription: { color: colors.muted, lineHeight: 19, fontSize: 13 },
  moduleArrow: { color: colors.muted, fontSize: 30, marginLeft: 10 },
  footerAction: { marginTop: 18 },
});
