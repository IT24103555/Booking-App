import React, { useContext, useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, SafeAreaView } from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { AuthContext } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import { getErrorMessage } from '../../api/apiClient';
import { validateProfileForm, validateName, validatePhone } from '../../utils/accountValidators';

const UI = { primary: '#EC168C', purple: '#7C3AED', background: '#FFF7FC', surface: '#FFFFFF', text: '#111827', muted: '#7C7C8A', border: '#F0DDEB', softPink: '#FFE7F4' };

function MenuRow({ icon, title, onPress, danger }) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.menuRow}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}><Text>{icon}</Text></View>
      <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

function ReadOnlyCard({ label, value }) {
  return (
    <View style={styles.readOnlyCard}>
      <Text style={styles.readOnlyLabel}>{label}</Text>
      <Text style={styles.readOnlyValue}>{value || '-'}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, refreshProfile, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const hasFieldErrors = Boolean(errors.name || errors.phone);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setErrors({});
  }, [user]);

  const handleNameChange = (value) => {
    setName(value);
    const nameError = validateName(value);
    setErrors((current) => ({
      ...current,
      name: nameError,
    }));
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    const phoneError = validatePhone(value);
    setErrors((current) => ({
      ...current,
      phone: phoneError,
    }));
  };

  const onSave = async () => {
    setError('');
    const validation = validateProfileForm({ name, phone });
    setErrors(validation.errors);
    if (!validation.valid) return;

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.profileHero}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.profileName}>{user?.name || 'Profile'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.rolePill}><Text style={styles.roleText}>{user?.role || 'customer'}</Text></View>
          </View>

          <View style={styles.cardStack}>
            <ReadOnlyCard label="Email" value={user?.email || 'user@example.com'} />
            <ReadOnlyCard label="Role" value={(user?.role || 'customer').toUpperCase()} />
          </View>

          <View style={styles.editCard}>
            <Text style={styles.cardTitle}>Edit Profile</Text>
            <Text style={styles.cardSubtitle}>Only your name and phone number can be updated here.</Text>
            {hasFieldErrors ? <Text style={styles.validationNotice}>Please fix the highlighted fields before saving.</Text> : null}
            <ErrorMessage message={error} />

            <AppInput
              label="Full Name"
              value={name}
              onChangeText={handleNameChange}
              placeholder="Enter name"
              error={errors.name}
            />

            <AppInput
              label="Phone Number"
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="Enter phone"
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <AppButton title={saving ? 'Saving...' : 'Save Changes'} onPress={onSave} disabled={saving} />
            <View style={styles.logoutSpacer} />
            <AppButton title="Logout" variant="danger" onPress={logout} />
          </View>

          {user?.role !== 'admin' && (
            <View style={styles.menuCard}>
              <MenuRow icon="🎟️" title="My Bookings" onPress={() => navigation?.navigate?.('MyBookings')} />
              <MenuRow icon="🔔" title="Notifications" onPress={() => navigation?.navigate?.('Notifications')} />
              <MenuRow icon="💬" title="Help & Support" onPress={() => navigation?.navigate?.('Chatbot')} />
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background },
  keyboardView: { flex: 1 },
  page: { padding: 18, paddingBottom: 34 },
  profileHero: { backgroundColor: UI.primary, borderRadius: 30, padding: 24, alignItems: 'center', shadowColor: UI.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.24, shadowRadius: 20, elevation: 9 },
  avatarOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: UI.primary, fontSize: 31, fontWeight: '900' },
  profileName: { color: '#fff', fontSize: 23, fontWeight: '900', marginTop: 14 },
  profileEmail: { color: 'rgba(255,255,255,0.86)', fontSize: 13, fontWeight: '700', marginTop: 4 },
  rolePill: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7, marginTop: 14 },
  roleText: { color: '#fff', fontWeight: '900', fontSize: 12, textTransform: 'capitalize' },
  cardStack: { marginTop: 16, gap: 12 },
  readOnlyCard: { backgroundColor: '#fff', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: UI.border, shadowColor: '#9D174D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 3 },
  readOnlyLabel: { color: UI.muted, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  readOnlyValue: { color: UI.text, fontSize: 15, fontWeight: '800', marginTop: 6 },
  menuCard: { backgroundColor: '#fff', borderRadius: 24, paddingVertical: 6, marginTop: 16, borderWidth: 1, borderColor: UI.border },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F7E8F2' },
  menuIcon: { width: 36, height: 36, borderRadius: 13, backgroundColor: UI.softPink, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuIconDanger: { backgroundColor: '#FEE2E2' },
  menuTitle: { flex: 1, color: UI.text, fontSize: 14, fontWeight: '800' },
  menuTitleDanger: { color: '#EF4444' },
  menuArrow: { color: UI.muted, fontSize: 24, fontWeight: '700' },
  editCard: { backgroundColor: '#fff', borderRadius: 24, padding: 18, marginTop: 16, borderWidth: 1, borderColor: UI.border, shadowColor: '#9D174D', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 5 },
  cardTitle: { color: UI.text, fontWeight: '900', fontSize: 18 },
  cardSubtitle: { color: UI.muted, fontWeight: '600', fontSize: 13, lineHeight: 20, marginTop: 5, marginBottom: 14 },
  validationNotice: { color: '#B91C1C', backgroundColor: '#FEE2E2', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, fontWeight: '800', marginBottom: 12 },
  logoutSpacer: { height: 12 },
});
