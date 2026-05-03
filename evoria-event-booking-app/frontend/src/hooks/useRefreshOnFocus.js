import React from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Custom hook to refresh data when a screen comes into focus.
 * 
 * Use this hook to automatically reload data from the backend when the user
 * navigates back to a screen (e.g., after create/update/delete operations).
 * 
 * @param {Function} callback - The function to call when screen is focused.
 *                              Typically your load() function.
 * @param {Array} dependencies - Optional dependency array (default: empty []).
 * 
 * Example:
 * 
 *   const load = async () => {
 *     const res = await eventApi.getAll();
 *     setItems(res.data);
 *   };
 *   
 *   useRefreshOnFocus(() => load());
 * 
 */
export function useRefreshOnFocus(callback, dependencies = []) {
  useFocusEffect(
    React.useCallback(() => {
      // Call the callback function when screen is focused
      if (callback && typeof callback === 'function') {
        callback();
      }
    }, [callback, ...dependencies])
  );
}
