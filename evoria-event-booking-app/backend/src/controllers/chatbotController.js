// ========================================
// CHATBOT CONTROLLER
// ========================================
// This file handles HTTP requests for the chatbot.
// Controller pattern: Receives request -> calls service -> returns response

// Import the chatbot service (contains intent matching logic)
const { getReply } = require('../services/chatbotService');

// ========================================
// CONTROLLER FUNCTION: Handle chatbot message
// ========================================
// Purpose: Receive user message and send bot reply
// HTTP Method: POST
// Endpoint: /api/chatbot/message
// Request body: { "message": "user question" }
// Response: { "success": true, "reply": "bot answer" }

const sendMessage = async (req, res, next) => {
  try {
    // ========================================
    // STEP 1: Extract message from request
    // ========================================
    const { message } = req.body;

    // ========================================
    // STEP 2: Validate input
    // ========================================
    // Check if message was provided
    if (!message || String(message).trim().length === 0) {
      // Return error if message is empty
      return res.status(400).json({
        success: false,
        message: 'Please provide a message',
        reply: 'I need a message to help you! Try asking about events, bookings, or tickets.',
      });
    }

    // ========================================
    // STEP 3: Get bot reply from service
    // ========================================
    // The service will:
    // - Clean the message
    // - Match it to an intent
    // - Return an appropriate reply
    const result = getReply(message);

    // ========================================
    // STEP 4: Return response to client
    // ========================================
    // Send back success response with the reply
    return res.status(200).json({
      success: true,
      userMessage: message, // Echo back what user said (optional)
      reply: result.reply, // The bot's response
      intent: result.intent, // Which intent was matched (optional)
    });
  } catch (err) {
    // If there's any error, catch it and send error response
    console.error('Chatbot error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred',
      reply: 'Sorry, I encountered an error. Please try again later.',
    });
  }
};

// ========================================
// EXPORT CONTROLLER
// ========================================
// Export so routes file can use it

module.exports = {
  sendMessage,
};
