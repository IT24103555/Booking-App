import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import AppButton from './AppButton';

export default function EmptyState({ title = 'No data found', description, actionTitle, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionTitle && onAction ? <AppButton title={actionTitle} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 18 },
  title: { color: colors.muted },
  description: { color: colors.muted, marginTop: 6, lineHeight: 18 },
});
