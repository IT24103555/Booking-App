import React from 'react';
import { Pressable, StyleSheet, View, Text, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';

// FloatingChatButton
// Reusable floating chat button shown on authenticated screens.
// Uses absolute positioning and elevation so it floats above other UI.
export default function FloatingChatButton() {
  const navigation = useNavigation();
  const [hidden, setHidden] = React.useState(false);

  // Determine root navigator and watch for navigation state changes so we can hide
  // the FAB when the Chatbot screen is active (prevents overlaying input).
  React.useEffect(() => {
    let root = navigation;
    while (root.getParent && root.getParent()) {
      root = root.getParent();
    }

    const update = () => {
      try {
        const state = root.getState();
        const top = state.routes[state.index];
        setHidden(top?.name === 'Chatbot');
      } catch (e) {
        // ignore
      }
    };

    update();
    const unsub = root.addListener('state', update);
    return () => unsub && unsub();
  }, [navigation]);

  const handlePress = () => {
    // Navigate to the existing Chatbot screen at root level
    navigation.navigate('Chatbot');
  };

  if (hidden) return null;

  return (
    <View pointerEvents="box-none" style={styles.container} accessible={false}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open chat"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handlePress}
      >
        <Text style={styles.icon}>💬</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 25,
    zIndex: 1100,
    elevation: 1100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    // Android elevation
    elevation: Platform.OS === 'android' ? 6 : 0,
  },
  fabPressed: {
    opacity: 0.86,
  },
  icon: {
    fontSize: 24,
    color: '#fff',
    lineHeight: 26,
  },
});
