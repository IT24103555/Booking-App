// ========================================
// CHATBOT ROUTES
// ========================================
// This file sets up the HTTP endpoints for the chatbot.
// Routes map URLs to controller functions.

// Import Express
const express = require('express');

// Import controller
const { sendMessage } = require('../controllers/chatbotController');

// Create router
const router = express.Router();

// ========================================
// ROUTE: POST /api/chatbot/message
// ========================================
// Purpose: Send a message to the chatbot and get a reply
// Method: POST
// Body: { "message": "your question" }
// Response: { "success": true, "reply": "bot answer" }
// Example:
// curl -X POST http://localhost:5000/api/chatbot/message \
//   -H "Content-Type: application/json" \
//   -d '{"message": "Hello, how do I book a ticket?"}'

router.post('/message', sendMessage);

// ========================================
// EXPORT ROUTER
// ========================================
// Export so it can be used in main server.js

module.exports = router;
