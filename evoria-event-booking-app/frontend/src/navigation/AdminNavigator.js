import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/common/DashboardScreen';

import UserListScreen from '../screens/users/UserListScreen';
import UserDetailsScreen from '../screens/users/UserDetailsScreen';
import EditUserScreen from '../screens/users/EditUserScreen';

import TicketTypeListScreen from '../screens/ticketTypes/TicketTypeListScreen';
import AddTicketTypeScreen from '../screens/ticketTypes/AddTicketTypeScreen';
import EditTicketTypeScreen from '../screens/ticketTypes/EditTicketTypeScreen';
import TicketTypeDetailsScreen from '../screens/ticketTypes/TicketTypeDetailsScreen';

import VenueListScreen from '../screens/venues/VenueListScreen';
import AddVenueScreen from '../screens/venues/AddVenueScreen';
import EditVenueScreen from '../screens/venues/EditVenueScreen';
import VenueDetailsScreen from '../screens/venues/VenueDetailsScreen';

import EventListScreen from '../screens/events/EventListScreen';
import AddEventScreen from '../screens/events/AddEventScreen';
import EditEventScreen from '../screens/events/EditEventScreen';
import EventDetailsScreen from '../screens/events/EventDetailsScreen';

import BookingListScreen from '../screens/bookings/BookingListScreen';
import EditBookingScreen from '../screens/bookings/EditBookingScreen';
import BookingDetailsScreen from '../screens/bookings/BookingDetailsScreen';

import SessionAgendaListScreen from '../screens/sessionAgenda/SessionAgendaListScreen';
import AddSessionAgendaScreen from '../screens/sessionAgenda/AddSessionAgendaScreen';
import EditSessionAgendaScreen from '../screens/sessionAgenda/EditSessionAgendaScreen';
import SessionAgendaDetailsScreen from '../screens/sessionAgenda/SessionAgendaDetailsScreen';

import NotificationScreen from '../screens/notifications/NotificationScreen';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />

      <Stack.Screen name="UserList" component={UserListScreen} options={{ title: 'Users' }} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} options={{ title: 'User Details' }} />
      <Stack.Screen name="EditUser" component={EditUserScreen} options={{ title: 'Edit User' }} />

      <Stack.Screen name="TicketTypeList" component={TicketTypeListScreen} options={{ title: 'Ticket Types' }} />
      <Stack.Screen name="AddTicketType" component={AddTicketTypeScreen} options={{ title: 'Add Ticket Type' }} />
      <Stack.Screen name="EditTicketType" component={EditTicketTypeScreen} options={{ title: 'Edit Ticket Type' }} />
      <Stack.Screen name="TicketTypeDetails" component={TicketTypeDetailsScreen} options={{ title: 'Ticket Type Details' }} />

      <Stack.Screen name="VenueList" component={VenueListScreen} options={{ title: 'Venues' }} />
      <Stack.Screen name="AddVenue" component={AddVenueScreen} options={{ title: 'Add Venue' }} />
      <Stack.Screen name="EditVenue" component={EditVenueScreen} options={{ title: 'Edit Venue' }} />
      <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} options={{ title: 'Venue Details' }} />

      <Stack.Screen name="EventList" component={EventListScreen} options={{ title: 'Events' }} />
      <Stack.Screen name="AddEvent" component={AddEventScreen} options={{ title: 'Add Event' }} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event' }} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />

      <Stack.Screen name="BookingList" component={BookingListScreen} options={{ title: 'Bookings' }} />
      <Stack.Screen name="EditBooking" component={EditBookingScreen} options={{ title: 'Edit Booking' }} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} options={{ title: 'Booking Details' }} />

      <Stack.Screen name="SessionAgendaList" component={SessionAgendaListScreen} options={{ title: 'Session Agendas' }} />
      <Stack.Screen name="AddSessionAgenda" component={AddSessionAgendaScreen} options={{ title: 'Add Session' }} />
      <Stack.Screen name="EditSessionAgenda" component={EditSessionAgendaScreen} options={{ title: 'Edit Session' }} />
      <Stack.Screen
        name="SessionAgendaDetails"
        component={SessionAgendaDetailsScreen}
        options={{ title: 'Session Details' }}
      />
    </Stack.Navigator>
  );
}
