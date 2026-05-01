import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { userApi } from '../../api/userApi';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors } from '../../constants/colors';
import { isEmail } from '../../utils/validators';

const ROLE_OPTIONS = ['customer', 'organizer', 'admin'];
const ACTIVE_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

function OptionChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.optionChip, selected ? styles.optionChipSelected : null]}
    >
      <Text style={[styles.optionText, selected ? styles.optionTextSelected : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function EditUserScreen({ route, navigation }) {
  const { id } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [isActive, setIsActive] = useState('true');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await userApi.getById(id);
        const u = res.data;
        setName(u?.name || '');
        setEmail(u?.email || '');
        setPhone(u?.phone || '');
        setRole(u?.role || 'customer');
        setIsActive(String(u?.isActive ?? true));
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSave = async () => {
    setError('');
    if (email && !isEmail(email)) {
      setError('Valid email is required');
      return;
    }
    if (!ROLE_OPTIONS.includes(role)) {
      setError('Role must be admin, organizer, or customer');
      return;
    }
    if (!['true', 'false'].includes(isActive)) {
      setError('isActive must be true or false');
      return;
    }

    try {
      setSaving(true);
      await userApi.updateById(id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        isActive: isActive === 'true',
      });
      Alert.alert('Success', 'User updated');
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Administration</Text>
          <Text style={styles.title}>Edit User</Text>
          <Text style={styles.subtitle}>Update account identity, role, and access status safely.</Text>
        </View>

        <View style={styles.card}>
          <ErrorMessage message={error} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Basic information</Text>
            <Text style={styles.sectionHint}>Keep user details accurate for notifications and access control.</Text>
          </View>

          <AppInput label="Name" value={name} onChangeText={setName} placeholder="User name" />
          <AppInput label="Email" value={email} onChangeText={setEmail} placeholder="User email" keyboardType="email-address" />
          <AppInput label="Phone" value={phone} onChangeText={setPhone} placeholder="Optional" keyboardType="phone-pad" />

          <View style={styles.optionSection}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.optionRow}>
              {ROLE_OPTIONS.map((option) => (
                <OptionChip
                  key={option}
                  label={option.charAt(0).toUpperCase() + option.slice(1)}
                  selected={role === option}
                  onPress={() => setRole(option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.optionSection}>
            <Text style={styles.label}>Account status</Text>
            <View style={styles.optionRow}>
              {ACTIVE_OPTIONS.map((option) => (
                <OptionChip
                  key={option.value}
                  label={option.label}
                  selected={isActive === option.value}
                  onPress={() => setIsActive(option.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton title={saving ? 'Saving...' : 'Save Changes'} onPress={onSave} disabled={saving} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: colors.background },
  page: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  header: {
    maxWidth: 620,
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
    marginBottom: 8,
  },
  title: { fontSize: 34, fontWeight: '900', color: colors.text, letterSpacing: -0.4 },
  subtitle: { marginTop: 10, color: colors.muted, fontSize: 15, lineHeight: 22 },
  card: {
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
  },
  sectionHeader: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  sectionHint: { marginTop: 4, color: colors.muted, lineHeight: 19 },
  optionSection: { marginTop: 10, marginBottom: 6 },
  label: { color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: 10 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: { color: colors.muted, fontWeight: '800', fontSize: 13 },
  optionTextSelected: { color: '#FFFFFF' },
  actions: { marginTop: 16 },
});
