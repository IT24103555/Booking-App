import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function AppCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginVertical: 6,
  },
});
