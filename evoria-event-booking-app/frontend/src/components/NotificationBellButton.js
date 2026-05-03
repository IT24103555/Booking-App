import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { notificationApi } from '../api/notificationApi';
import { colors } from '../constants/colors';

export default function NotificationBellButton({ size = 44, style }) {
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(Number(res?.data?.count || 0));
    } catch (err) {
      setUnreadCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const refresh = async () => {
        if (!active) return;
        await loadUnreadCount();
      };

      refresh();
      const timer = setInterval(refresh, 30000);

      return () => {
        active = false;
        clearInterval(timer);
      };
    }, [loadUnreadCount])
  );

  const handlePress = () => {
    navigation.navigate('Notifications');
  };

  return (
    <View style={[styles.wrapper, style]} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open notifications"
        onPress={handlePress}
        style={({ pressed }) => [styles.button, { width: size, height: size, borderRadius: size / 2 }, pressed && styles.pressed]}
      >
        <Text style={styles.icon}>🔔</Text>
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  pressed: {
    opacity: 0.82,
  },
  icon: {
    fontSize: 19,
    lineHeight: 20,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
});