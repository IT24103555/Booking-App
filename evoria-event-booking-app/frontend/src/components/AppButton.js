import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

// Reusable button component
export default function AppButton({ title, onPress, variant = 'primary', disabled = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'danger' ? styles.danger : styles.primary,
        disabled ? styles.disabled : null,
      ]}
    >
      <View style={styles.inner}>
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  inner: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
