import React, { useContext, useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../constants/colors';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { AuthContext } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import { getErrorMessage } from '../../api/apiClient';
import { isRequired } from '../../utils/validators';

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, refreshProfile, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user]);

  const onSave = async () => {
    setError('');
    if (!isRequired(name)) {
      setError('Name is required.');
      return;
    }

    try {
      setSaving(true);
      await userApi.updateMe({ name: name.trim(), phone: phone.trim() });
      await refreshProfile();
      Alert.alert('Success', 'Profile updated');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.shell}>
          <View style={styles.profileHero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.kicker}>My account</Text>
              <Text style={styles.title}>{user?.name || 'Profile'}</Text>
              <Text style={styles.subtitle}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <InfoRow label="Role" value={user?.role} />
            <InfoRow label="Email" value={user?.email} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Edit profile</Text>
            <Text style={styles.cardSubtitle}>Keep your contact details up to date for booking communication.</Text>
            <ErrorMessage message={error} />
            <AppInput label="Full name" value={name} onChangeText={setName} placeholder="Enter name" />
            <AppInput label="Phone number" value={phone} onChangeText={setPhone} placeholder="Optional phone" keyboardType="phone-pad" />
            <AppButton title={saving ? 'Saving...' : 'Save changes'} onPress={onSave} disabled={saving} />
          </View>

          <View style={styles.logoutArea}>
            <AppButton title="Logout" variant="danger" onPress={logout} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: colors.background },
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  shell: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  profileHero: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 4,
  },
  avatar: { width: 68, height: 68, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 28 },
  heroContent: { flex: 1 },
  kicker: { color: '#fff', opacity: 0.82, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  subtitle: { color: '#fff', opacity: 0.84, marginTop: 4 },
  infoCard: { backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.border, marginBottom: 14, overflow: 'hidden' },
  infoRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  infoLabel: { color: colors.muted, fontWeight: '700' },
  infoValue: { color: colors.text, fontWeight: '800', flex: 1, textAlign: 'right' },
  card: { backgroundColor: colors.card, borderRadius: 28, padding: 22, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 3 },
  cardTitle: { color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  cardSubtitle: { color: colors.muted, lineHeight: 21, marginBottom: 14 },
  logoutArea: { marginTop: 14 },
});
