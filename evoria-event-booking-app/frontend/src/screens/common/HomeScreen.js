import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../constants/colors';

function FeatureCard({ value, label, description }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureValue}>{value}</Text>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.shell}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Event booking platform</Text>
          </View>
          <Text style={styles.title}>Welcome to Evoria</Text>
          <Text style={styles.subtitle}>
            Discover campus events, manage bookings, follow agendas, and keep your event experience simple from start to finish.
          </Text>
        </View>

        <View style={styles.grid}>
          <FeatureCard value="Fast" label="Find events instantly" description="Browse upcoming events and open details in a few taps." />
          <FeatureCard value="Easy" label="Book without friction" description="Reserve tickets, review status, and manage bookings quickly." />
          <FeatureCard value="Organized" label="Everything in one place" description="Events, ticket types, sessions, and profile details stay connected." />
        </View>

        <View style={styles.infoPanel}>
          <Text style={styles.infoTitle}>Built for students and organizers</Text>
          <Text style={styles.infoText}>
            A clean mobile-first experience with reusable components, clear states, and simple navigation between important modules.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  shell: { maxWidth: 980, width: '100%', alignSelf: 'center' },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 34,
    padding: 28,
    marginBottom: 18,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 5,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 14,
  },
  badgeText: { color: '#fff', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.1 },
  title: { fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: -0.8, lineHeight: 46 },
  subtitle: { marginTop: 12, color: '#fff', opacity: 0.86, fontSize: 16, lineHeight: 25, maxWidth: 740 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 16 },
  featureCard: {
    flexGrow: 1,
    flexBasis: 250,
    backgroundColor: colors.card,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  featureValue: { fontSize: 24, fontWeight: '900', color: colors.primary, marginBottom: 6 },
  featureLabel: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 7 },
  featureDescription: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  infoPanel: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: { fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 8 },
  infoText: { color: colors.muted, lineHeight: 22 },
});
