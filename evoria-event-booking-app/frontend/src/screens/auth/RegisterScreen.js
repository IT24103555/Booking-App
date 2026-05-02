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
    if (!isRequired(name)) return setError('Name is required.');
    if (!isRequired(email) || !isEmail(email)) return setError('Please enter a valid email address.');
    if (!isRequired(password) || !minLength(password, 6)) return setError('Password must contain at least 6 characters.');

    try {
      setLoading(true);
      await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() });
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
            <Text style={styles.brandIcon}>✦</Text>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Evoria and explore events</Text>

          <View style={styles.formCard}>
            <ErrorMessage message={error} />
            <AppInput label="Full Name" value={name} onChangeText={setName} placeholder="Enter your full name" />
            <AppInput
              label="Email Address"
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
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Optional phone number"
              keyboardType="phone-pad"
            />

            <View style={styles.termsRow}>
              <View style={styles.checkBox}><Text style={styles.checkMark}>✓</Text></View>
              <Text style={styles.termsText}>I agree to the <Text style={styles.linkInline}>Terms & Conditions</Text> and <Text style={styles.linkInline}>Privacy Policy</Text></Text>
            </View>

            <AppButton title={loading ? 'Creating account...' : 'Sign Up'} onPress={onSubmit} disabled={loading} />

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}> Login</Text>
              </TouchableOpacity>
            </View>
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
  decorOne: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: UI.softPink, top: -55, left: -65 },
  decorTwo: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#F4E8FF', bottom: 80, right: -50 },
  brandCircle: {
    alignSelf: 'center', width: 74, height: 74, borderRadius: 37, backgroundColor: UI.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    shadowColor: UI.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 18, elevation: 10,
  },
  brandIcon: { color: '#fff', fontSize: 30, fontWeight: '900' },
  title: { textAlign: 'center', fontSize: 27, fontWeight: '900', color: UI.text, marginBottom: 6 },
  subtitle: { textAlign: 'center', color: UI.muted, fontSize: 14, marginBottom: 22 },
  formCard: {
    backgroundColor: UI.card, borderRadius: 28, padding: 18, borderWidth: 1, borderColor: UI.border,
    shadowColor: '#9D174D', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.09, shadowRadius: 24, elevation: 8,
  },
  termsRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginVertical: 18 },
  checkBox: { width: 20, height: 20, borderRadius: 6, backgroundColor: UI.primary, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#fff', fontWeight: '900', fontSize: 12 },
  termsText: { flex: 1, color: UI.muted, fontSize: 12, lineHeight: 18 },
  linkInline: { color: UI.primary, fontWeight: '800' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  bottomText: { color: UI.text, fontSize: 13 },
  linkText: { color: UI.primary, fontWeight: '900', fontSize: 13 },
});
