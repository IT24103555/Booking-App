import { Alert } from 'react-native';

// Simple reusable confirmation dialog
// Usage:
// confirmDialog({ title: 'Delete?', message: 'Are you sure?', onConfirm: () => ... })

export const confirmDialog = ({ title, message, confirmText = 'Yes', cancelText = 'No', onConfirm }) => {
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
};
