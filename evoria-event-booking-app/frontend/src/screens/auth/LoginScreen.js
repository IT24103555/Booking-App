import React, { useContext, useState } from 'react';
import {
  Alert,
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
  primaryDark: '#C61172',
  purple: '#7C3AED',
  background: '#FFF7FC',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#7C7C8A',
  border: '#F0DDEB',
  softPink: '#FFE7F4',
};

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!isRequired(email) || !isEmail(email)) return setError('Please enter a valid email address.');
    if (!isRequired(password) || !minLength(password, 6)) return setError('Password must contain at least 6 characters.');

    try {
      setLoading(true);
      await login(email.trim(), password);
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset is not configured in this build yet.');
  };

  const onSocialLogin = (provider) => {
    Alert.alert(provider, 'Social login is not configured in this build yet.');
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

          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to continue to Evoria</Text>

          <View style={styles.formCard}>
            <ErrorMessage message={error} />

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
              placeholder="Enter your password"
              secureTextEntry
            />

            <TouchableOpacity activeOpacity={0.8} style={styles.forgotButton} onPress={onForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AppButton title={loading ? 'Logging in...' : 'Login'} onPress={onSubmit} disabled={loading} />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity activeOpacity={0.85} style={styles.socialButton} onPress={() => onSocialLogin('Google')}><Text style={styles.socialText}>G</Text></TouchableOpacity>
              <TouchableOpacity activeOpacity={0.85} style={styles.socialButton} onPress={() => onSocialLogin('Apple')}><Text style={styles.socialText}></Text></TouchableOpacity>
              <TouchableOpacity activeOpacity={0.85} style={styles.socialButton} onPress={() => onSocialLogin('Facebook')}><Text style={styles.socialText}>f</Text></TouchableOpacity>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Don’t have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}> Sign Up</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.adminLink} onPress={() => navigation.navigate('AdminRegister')}>
              <Text style={styles.adminLinkText}>Create admin account</Text>
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
  page: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 32,
  },
  decorOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: UI.softPink,
    top: -50,
    right: -70,
  },
  decorTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F4E8FF',
    bottom: 70,
    left: -55,
  },
  brandCircle: {
    alignSelf: 'center',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: UI.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  brandIcon: { color: '#fff', fontSize: 30, fontWeight: '900' },
  title: { textAlign: 'center', fontSize: 27, fontWeight: '900', color: UI.text, marginBottom: 6 },
  subtitle: { textAlign: 'center', color: UI.muted, fontSize: 14, marginBottom: 24 },
  formCard: {
    backgroundColor: UI.card,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: UI.border,
    shadowColor: '#9D174D',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 8,
  },
  forgotButton: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 18 },
  forgotText: { color: UI.primary, fontWeight: '800', fontSize: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22, gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: UI.border },
  dividerText: { color: UI.muted, fontSize: 12, fontWeight: '600' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialButton: {
    width: 58,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  socialText: { fontSize: 21, fontWeight: '900', color: UI.text },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 26 },
  bottomText: { color: UI.text, fontSize: 13 },
  linkText: { color: UI.primary, fontWeight: '900', fontSize: 13 },
  adminLink: { alignItems: 'center', marginTop: 14, paddingVertical: 8 },
  adminLinkText: { color: UI.purple, fontWeight: '800', fontSize: 12 },
});
