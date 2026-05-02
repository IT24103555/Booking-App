import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/common/HomeScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';
import BookingListScreen from '../screens/bookings/BookingListScreen';
import BookingDetailsScreen from '../screens/bookings/BookingDetailsScreen';
import CreateBookingScreen from '../screens/bookings/CreateBookingScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import ChatbotScreen from '../screens/chat/ChatbotScreen';
import FloatingChatButton from '../components/FloatingChatButton';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomTabBar(props) {
  // Custom tab bar to render default tab bar and the floating chat button
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
      <BottomTabBar {...props} />
      <FloatingChatButton />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyBookings" component={BookingListScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
      <Stack.Screen name="CreateBooking" component={CreateBookingScreen} options={{ title: 'Create Booking' }} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} options={{ title: 'Booking Details' }} />
      {/* Chatbot as modal screen (opened from FAB) */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ headerShown: false }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
