import React, { useContext, useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import AppButton from '../../components/AppButton';
import NotificationBellButton from '../../components/NotificationBellButton';
import { AuthContext } from '../../context/AuthContext';
import { eventApi } from '../../api/eventApi';
import { bookingApi } from '../../api/bookingApi';
import { userApi } from '../../api/userApi';

const UI = { primary: '#EC168C', purple: '#7C3AED', background: '#FFF7FC', surface: '#FFFFFF', text: '#111827', muted: '#7C7C8A', border: '#F0DDEB', softPink: '#FFE7F4' };

const MODULES = [
  { title: 'Users', description: 'Manage platform accounts and roles.', route: 'UserList', icon: '👥' },
  { title: 'Ticket Types', description: 'Create pricing tiers and availability.', route: 'TicketTypeList', icon: '🎟️' },
  { title: 'Venues', description: 'Maintain event locations and capacity.', route: 'VenueList', icon: '📍' },
  { title: 'Events', description: 'Publish and manage upcoming events.', route: 'EventList', icon: '🗓️' },
  { title: 'Bookings', description: 'Review reservations and booking status.', route: 'BookingList', icon: '✅' },
  { title: 'Session Agendas', description: 'Organize sessions, speakers, and schedules.', route: 'SessionAgendaList', icon: '🎤' },
  { title: 'Settings', description: 'Update your profile and account settings.', route: 'Settings', icon: '⚙️' },
];

function SummaryCard({ label, value }) {
  return <View style={styles.summaryCard}><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}

function ModuleCard({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.moduleCard} onPress={onPress}>
      <View style={styles.moduleIcon}><Text style={styles.moduleIconText}>{item.icon}</Text></View>
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
  const [summary, setSummary] = useState({ events: 0, bookings: 0, users: 0, revenue: 0 });

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      try {
        const [eventsRes, bookingsRes, usersRes] = await Promise.all([
          eventApi.getAllAdmin?.() || eventApi.getAll(),
          bookingApi.getAll(),
          userApi.getAll(),
        ]);

        const events = Array.isArray(eventsRes?.data) ? eventsRes.data.length : 0;
        const bookings = Array.isArray(bookingsRes?.data) ? bookingsRes.data : [];
        const users = Array.isArray(usersRes?.data) ? usersRes.data.length : 0;
        const revenue = bookings.reduce((total, item) => total + Number(item?.totalAmount || 0), 0);

        if (mounted) {
          setSummary({ events, bookings: bookings.length, users, revenue });
        }
      } catch (error) {
        console.error('Failed to load dashboard summary:', error);
      }
    };

    loadSummary();
    return () => { mounted = false; };
  }, []);

  const onMenuPress = () => {
    Alert.alert('Menu', 'This shortcut is not connected yet. Use the module cards below.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backText}>‹</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={styles.headerActions}>
            <NotificationBellButton size={40} />
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.menuText}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}><Text style={styles.menuText}>☰</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Control center</Text>
          <Text style={styles.title}>Welcome, {user?.name || 'Admin'}</Text>
          <Text style={styles.subtitle}>{user?.email || 'admin@evoria.com'} · {user?.role || 'member'}</Text>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard label="Total Events" value={String(summary.events)} />
          <SummaryCard label="Total Bookings" value={String(summary.bookings)} />
          <SummaryCard label="Total Users" value={String(summary.users)} />
          <SummaryCard label="Total Revenue" value={`LKR ${summary.revenue.toLocaleString()}`} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Manage Platform</Text>
        </View>
        <View style={styles.moduleList}>
          {MODULES.map((item) => <ModuleCard key={item.route} item={item} onPress={() => navigation.navigate(item.route)} />)}
        </View>

        <View style={styles.footerAction}>
          <AppButton title="Logout" variant="danger" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background },
  page: { padding: 18, paddingBottom: 36 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: UI.border },
  backText: { color: UI.text, fontSize: 28, lineHeight: 28, fontWeight: '900' },
  menuButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: UI.border },
  menuText: { color: UI.text, fontSize: 18, fontWeight: '900' },
  iconButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: UI.border, marginHorizontal: 6 },
  headerTitle: { color: UI.text, fontWeight: '900', fontSize: 17 },
  heroCard: { backgroundColor: UI.primary, borderRadius: 28, padding: 22, marginBottom: 16, shadowColor: UI.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 9 },
  kicker: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { color: '#fff', fontSize: 25, fontWeight: '900', marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.86)', fontWeight: '700', marginTop: 6 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryCard: { width: '48%', minHeight: 92, backgroundColor: '#fff', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: UI.border },
  summaryValue: { color: UI.text, fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: UI.muted, fontSize: 12, fontWeight: '800', marginTop: 8 },
  moduleList: { gap: 12 },
  moduleCard: { backgroundColor: '#fff', borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: UI.border, shadowColor: '#9D174D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  moduleIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: UI.softPink, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  moduleIconText: { fontSize: 21 },
  moduleContent: { flex: 1 },
  moduleTitle: { color: UI.text, fontSize: 15, fontWeight: '900' },
  moduleDescription: { color: UI.muted, fontSize: 12, fontWeight: '600', lineHeight: 18, marginTop: 4 },
  moduleArrow: { color: UI.primary, fontSize: 28, fontWeight: '900' },
  footerAction: { marginTop: 22 },
});
