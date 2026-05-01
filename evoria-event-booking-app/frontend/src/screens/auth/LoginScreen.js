import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../constants/colors';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { AuthContext } from '../../context/AuthContext';
import { isEmail, isRequired, minLength } from '../../utils/validators';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!isRequired(email) || !isEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isRequired(password) || !minLength(password, 6)) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    const ok = await login(email.trim(), password);
    setLoading(false);
    if (!ok) {
      // AuthContext already shows the main auth message.
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.shell}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>Evoria</Text>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.kicker}>Welcome back</Text>
            <Text style={styles.title}>Sign in and continue your event journey</Text>
            <Text style={styles.subtitle}>
              Manage bookings, explore sessions, and keep every event activity organized in one place.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Login</Text>
            <Text style={styles.cardSubtitle}>Use your registered account details below.</Text>
            <ErrorMessage message={error} />

            <AppInput
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />

            <AppButton title={loading ? 'Signing in...' : 'Sign in'} onPress={onSubmit} disabled={loading} />
            <View style={styles.divider} />
            <AppButton title="Create new account" onPress={() => navigation.navigate('Register')} />
            <View style={styles.buttonSpacer} />
            <AppButton title="Create admin account" onPress={() => navigation.navigate('AdminRegister')} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: colors.background },
  page: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  shell: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 14,
  },
  brandBadgeText: { color: '#fff', fontWeight: '900', letterSpacing: 0.5 },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
    elevation: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 4 },
  cardSubtitle: { color: colors.muted, marginBottom: 14, lineHeight: 20 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  buttonSpacer: { height: 10 },
});
