import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../../components/AppButton';

export default function EditUserScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.kicker}>Administration</Text>
          <Text style={styles.title}>User profile editing is restricted</Text>
          <Text style={styles.subtitle}>Admins cannot edit user profile details. Users must update their own profile.</Text>
          <AppButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF7FB' },
  page: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 22, borderWidth: 1, borderColor: '#FCE1EE', shadowColor: '#2D0A35', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 22, elevation: 5 },
  kicker: { color: '#F80678', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: '#1F1D2B', fontSize: 24, fontWeight: '900', marginTop: 8 },
  subtitle: { color: '#7A7185', fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 18 },
});