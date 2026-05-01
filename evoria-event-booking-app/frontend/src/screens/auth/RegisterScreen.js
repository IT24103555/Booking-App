import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../constants/colors';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { AuthContext } from '../../context/AuthContext';
import { isEmail, isRequired, minLength } from '../../utils/validators';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!isRequired(name)) {
      setError('Name is required.');
      return;
    }
    if (!isRequired(email) || !isEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isRequired(password) || !minLength(password, 6)) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() });
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.shell}>
          <View style={styles.heroCard}>
            <Text style={styles.kicker}>Create your account</Text>
            <Text style={styles.title}>Join Evoria and start booking smarter</Text>
            <Text style={styles.subtitle}>
              One profile for events, tickets, sessions, and booking management.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account details</Text>
            <Text style={styles.cardSubtitle}>Fill in the essentials. You can update your profile later.</Text>
            <ErrorMessage message={error} />

            <AppInput label="Full name" value={name} onChangeText={setName} placeholder="Enter your name" />
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
              placeholder="Minimum 6 characters"
              secureTextEntry
            />
            <AppInput
              label="Phone number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Optional"
              keyboardType="phone-pad"
            />

            <AppButton title={loading ? 'Creating account...' : 'Create account'} onPress={onSubmit} disabled={loading} />
            {navigation ? (
              <>
                <View style={styles.divider} />
                <AppButton title="Already have an account? Sign in" onPress={() => navigation.navigate('Login')} />
                <View style={styles.buttonSpacer} />
                <AppButton title="Create admin account" onPress={() => navigation.navigate('AdminRegister')} />
              </>
            ) : null}
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
  shell: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 24,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 4,
  },
  kicker: {
    color: '#fff',
    opacity: 0.86,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  title: { fontSize: 31, fontWeight: '900', color: '#fff', lineHeight: 37, letterSpacing: -0.5 },
  subtitle: { color: '#fff', opacity: 0.84, marginTop: 12, fontSize: 15, lineHeight: 23 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 4 },
  cardSubtitle: { color: colors.muted, marginBottom: 14, lineHeight: 20 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  buttonSpacer: { height: 10 },
});
