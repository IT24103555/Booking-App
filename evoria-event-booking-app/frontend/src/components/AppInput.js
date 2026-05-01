import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

// Reusable input with label
export default function AppInput({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={styles.input}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { marginBottom: 8, color: colors.text, fontWeight: '700', fontSize: 13 },
  input: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});
