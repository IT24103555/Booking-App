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
import { validateName, validatePhone } from '../../utils/accountValidators';
import { validateEmail, validatePassword, validatePasswordConfirm, getPasswordStrength, validateAdminForm } from '../../utils/passwordValidators';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  // Validation on field change
  const handleNameChange = (value) => {
    setName(value);
    const error = validateName(value);
    setErrors((prev) => {
      if (error) {
        return { ...prev, name: error };
      } else {
        const { name: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    const error = validateEmail(value);
    setErrors((prev) => {
      if (error) {
        return { ...prev, email: error };
      } else {
        const { email: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    const error = validatePassword(value);
    setErrors((prev) => {
      if (error) {
        return { ...prev, password: error };
      } else {
        const { password: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    const error = validatePasswordConfirm(password, value);
    setErrors((prev) => {
      if (error) {
        return { ...prev, confirmPassword: error };
      } else {
        const { confirmPassword: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    const error = validatePhone(value);
    setErrors((prev) => {
      if (error) {
        return { ...prev, phone: error };
      } else {
        const { phone: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleAdminKeyChange = (value) => {
    setAdminKey(value);
    if (value.trim().length < 6) {
      setErrors((prev) => ({ ...prev, adminKey: 'Admin key must be at least 6 characters.' }));
    } else {
      setErrors((prev) => {
        const { adminKey: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validationHasErrors = Object.keys(errors).length > 0;

  const onSubmit = async () => {
    setGlobalError('');

    // Full validation check
    const validation = validateAdminForm({
      name,
      email,
      password,
      confirmPassword,
      phone,
      adminKey,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      setGlobalError('Please fix the highlighted fields before proceeding.');
      return;
    }

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
            <ErrorMessage message={globalError} />

            {/* Name Field */}
            <AppInput
              label="Full Name"
              value={name}
              onChangeText={handleNameChange}
              placeholder="Admin full name"
              error={errors.name}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Email Field */}
            <AppInput
              label="Email Address"
              value={email}
              onChangeText={handleEmailChange}
              placeholder="admin@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Password Field */}
            <View>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                {password && (
                  <View style={[styles.strengthIndicator, { backgroundColor: passwordStrength.color }]}>
                    <Text style={styles.strengthText}>{passwordStrength.label}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.passwordInputContainer, errors.password && styles.inputError]}>
                <AppInput
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="At least 8 characters with uppercase, lowercase & number"
                  secureTextEntry={!showPassword}
                  style={{ flex: 1 }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggleButton}
                >
                  <Text style={styles.passwordToggleIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Field */}
            <View>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Confirm Password</Text>
              </View>
              <View style={[styles.passwordInputContainer, errors.confirmPassword && styles.inputError]}>
                <AppInput
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  placeholder="Re-enter your password"
                  secureTextEntry={!showConfirmPassword}
                  style={{ flex: 1 }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggleButton}
                >
                  <Text style={styles.passwordToggleIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Phone Field */}
            <AppInput
              label="Phone Number"
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="Optional phone number"
              keyboardType="phone-pad"
              error={errors.phone}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            {/* Admin Key Field */}
            <AppInput
              label="Admin Key"
              value={adminKey}
              onChangeText={handleAdminKeyChange}
              placeholder="Enter admin key"
              secureTextEntry
              error={errors.adminKey}
            />
            {errors.adminKey && <Text style={styles.errorText}>{errors.adminKey}</Text>}

            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>🔐</Text>
              <Text style={styles.warningText}>Admin accounts have access to platform management features. Keep your login details secure.</Text>
            </View>

            <AppButton
              title={loading ? 'Creating admin...' : 'Create Admin'}
              onPress={onSubmit}
              disabled={loading || validationHasErrors}
            />

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
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: UI.text,
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -6,
    marginBottom: 12,
    marginLeft: 4,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  strengthText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: UI.border,
    borderRadius: 14,
    paddingRight: 8,
    marginBottom: 2,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  passwordToggleButton: {
    padding: 10,
    marginLeft: 4,
  },
  passwordToggleIcon: {
    fontSize: 18,
  },
  warningCard: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF0F8', borderWidth: 1, borderColor: UI.border, borderRadius: 18, padding: 12, marginVertical: 18 },
  warningIcon: { fontSize: 18 },
  warningText: { flex: 1, color: UI.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  backLink: { alignItems: 'center', paddingVertical: 14 },
  backLinkText: { color: UI.purple, fontWeight: '900', fontSize: 13 },
});
