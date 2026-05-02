import { Alert, Platform } from 'react-native';

// Simple reusable confirmation dialog
// Usage:
// confirmDialog({ title: 'Delete?', message: 'Are you sure?', onConfirm: () => ... })

export const confirmDialog = ({ title, message, confirmText = 'Yes', cancelText = 'No', onConfirm }) => {
  if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
    const confirmed = globalThis.confirm(`${title}\n\n${message}`);
    if (confirmed) onConfirm?.();
    return;
  }

  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
};
