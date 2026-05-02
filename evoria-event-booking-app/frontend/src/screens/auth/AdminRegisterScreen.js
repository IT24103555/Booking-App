import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { AuthContext } from '../../context/AuthContext';
import { isEmail, isRequired, minLength } from '../../utils/validators';

const UI = {
  primary: '#EC168C',
  purple: '#7C3AED',
  background: '#FFF7FC',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#7C7C8A',
  border: '#F0DDEB',
  softPink: '#FFE7F4',
};

export default function AdminRegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!isRequired(name)) return setError('Name is required.');
    if (!isRequired(email) || !isEmail(email)) return setError('Please enter a valid email address.');
    if (!isRequired(password) || !minLength(password, 6)) return setError('Password must contain at least 6 characters.');
    if (!isRequired(adminKey)) return setError('Admin key is required.');

    try {
      setLoading(true);
      await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), role: 'admin', adminKey: adminKey.trim() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.decorOne} />
          <View style={styles.decorTwo} />

          <View style={styles.brandCircle}>
            <Text style={styles.brandIcon}>⚙</Text>
          </View>
          <Text style={styles.kicker}>Admin Access</Text>
          <Text style={styles.title}>Create Admin Account</Text>
          <Text style={styles.subtitle}>Use your admin key to manage users, events, tickets, venues and bookings.</Text>

          <View style={styles.formCard}>
            <ErrorMessage message={error} />
            <AppInput label="Full Name" value={name} onChangeText={setName} placeholder="Admin full name" />
            <AppInput label="Email Address" value={email} onChangeText={setEmail} placeholder="admin@example.com" keyboardType="email-address" autoCapitalize="none" />
            <AppInput label="Password" value={password} onChangeText={setPassword} placeholder="Minimum 6 characters" secureTextEntry />
            <AppInput label="Phone Number" value={phone} onChangeText={setPhone} placeholder="Optional phone number" keyboardType="phone-pad" />
            <AppInput label="Admin Key" value={adminKey} onChangeText={setAdminKey} placeholder="Enter admin key" secureTextEntry />

            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>🔐</Text>
              <Text style={styles.warningText}>Admin accounts have access to platform management features. Keep your login details secure.</Text>
            </View>

            <AppButton title={loading ? 'Creating admin...' : 'Create Admin'} onPress={onSubmit} disabled={loading} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
              <Text style={styles.backLinkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background },
  keyboardView: { flex: 1 },
  page: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 30 },
  decorOne: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: UI.softPink, top: -60, right: -70 },
  decorTwo: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: '#F4E8FF', bottom: 70, left: -55 },
  brandCircle: {
    alignSelf: 'center', width: 74, height: 74, borderRadius: 37, backgroundColor: UI.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: UI.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 18, elevation: 10,
  },
  brandIcon: { color: '#fff', fontSize: 27, fontWeight: '900' },
  kicker: { textAlign: 'center', color: UI.primary, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase', fontSize: 12, marginBottom: 5 },
  title: { textAlign: 'center', fontSize: 27, fontWeight: '900', color: UI.text, marginBottom: 8 },
  subtitle: { textAlign: 'center', color: UI.muted, fontSize: 14, lineHeight: 21, marginBottom: 22, paddingHorizontal: 8 },
  formCard: {
    backgroundColor: UI.card, borderRadius: 28, padding: 18, borderWidth: 1, borderColor: UI.border,
    shadowColor: '#9D174D', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.09, shadowRadius: 24, elevation: 8,
  },
  warningCard: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF0F8', borderWidth: 1, borderColor: UI.border, borderRadius: 18, padding: 12, marginVertical: 18 },
  warningIcon: { fontSize: 18 },
  warningText: { flex: 1, color: UI.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  backLink: { alignItems: 'center', paddingVertical: 14 },
  backLinkText: { color: UI.purple, fontWeight: '900', fontSize: 13 },
});
