// ========================================
// CHATBOT API CLIENT
// ========================================
// This file provides a simple function to send messages to the chatbot backend.
// The mobile app uses this to communicate with the chatbot service.

import { apiClient } from './apiClient';

// ========================================
// EXPORT CHATBOT API FUNCTIONS
// ========================================

export const chatbotApi = {
  // Function to send a message to the chatbot
  // Parameter: message (string) - the user's question/message
  // Returns: response object with bot's reply
  // Example:
  // const response = await chatbotApi.sendMessage("How do I book a ticket?");
  // console.log(response.reply); // "To book a ticket:..."
  
  sendMessage: async (message) => {
    try {
      // Make POST request to backend chatbot endpoint
      const res = await apiClient.post('/chatbot/message', {
        message: message,
      });
      // Return the response data
      return res.data;
    } catch (error) {
      // If error occurs, return error response
      return {
        success: false,
        reply: 'Sorry, I cannot reach the chatbot service. Please try again later.',
        error: error.message,
      };
    }
  },
};
