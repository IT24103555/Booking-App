import React, { useContext } from 'react';

import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AppNavigator() {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) return <LoadingSpinner />;
  if (!token) return <AuthNavigator />;

  // Admin & Organizer get the dashboard flow
  if (user?.role === 'admin' || user?.role === 'organizer') {
    return <AdminNavigator />;
  }

  // Customers get the simpler main flow
  return <MainNavigator />;
}
