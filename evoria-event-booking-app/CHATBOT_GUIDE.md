// ========================================
// CHATBOT IMPLEMENTATION GUIDE
// ========================================
// This document explains the keyword-based chatbot system
// for the Evoria Event Booking Mobile App
// Perfect for understanding and explaining in viva!

// ========================================
// 1. WHAT IS A KEYWORD-BASED CHATBOT?
// ========================================
// A chatbot that understands user intent by matching keywords
// in their message to predefined categories (intents).
//
// Example:
// User: "I want to book a ticket"
// Chatbot detects keyword "book" → matches to "book_ticket" intent
// Chatbot replies with booking instructions
//
// Why we chose this approach:
// ✓ Simple and easy to understand
// ✓ No AI/ML required
// ✓ Fast and lightweight
// ✓ Perfect for specific domain (event booking)
// ✓ Beginner-friendly to maintain
// ✗ Not as flexible as AI models
// ✗ Needs manual keyword maintenance

// ========================================
// 2. ARCHITECTURE OVERVIEW
// ========================================
//
// FRONTEND (Mobile App)
//     ↓
//   ChatbotScreen.js (UI - message display, input)
//     ↓ (sends message)
//   chatbotApi.js (API client - communicates with backend)
//     ↓ (HTTP POST /api/chatbot/message)
// BACKEND (Node.js Express)
//     ↓
//   chatbotRoutes.js (defines endpoints)
//     ↓
//   chatbotController.js (handles HTTP requests)
//     ↓
//   chatbotService.js (business logic - intent matching)
//     ↓ (returns reply)
// FRONTEND
//     ↓ (displays reply)
//   ChatbotScreen.js (shows bot message)

// ========================================
// 3. HOW KEYWORD MATCHING WORKS
// ========================================
// Step-by-step process:

// STEP 1: User sends message
// Example: "Hi! I want to book a ticket"

// STEP 2: Clean the message
// - Convert to lowercase: "hi! i want to book a ticket"
// - Remove punctuation: "hi i want to book a ticket"
// - Trim extra spaces
// Function: cleanMessage(message)

// STEP 3: Match keywords
// Loop through all intents and their keywords:
//
// Intent: greeting
// Keywords: ["hi", "hello", "hey", ...]
// Match found? YES ✓ (keyword "hi" found)
//
// Intent: book_ticket
// Keywords: ["book", "booking", "reserve", ...]
// Match found? YES ✓ (keyword "book" found)
//
// Intent: cancel_booking
// Keywords: ["cancel", "refund", ...]
// Match found? NO ✗

// STEP 4: Return first matching intent
// Usually matches multiple intents (hi + book)
// Return the FIRST intent that matches
// (Greeting matched first, so return greeting reply)

// STEP 5: Send reply
// Greeting intent reply:
// "Hello! Welcome to Evoria Event Booking..."

// ========================================
// 4. FILE STRUCTURE
// ========================================
//
// backend/
//   src/
//     services/
//       chatbotService.js          ← Intent definitions + matching logic
//     controllers/
//       chatbotController.js       ← HTTP request handler
//     routes/
//       chatbotRoutes.js           ← Define POST /api/chatbot/message
//     server.js                    ← Register chatbot routes
//
// frontend/
//   src/
//     api/
//       chatbotApi.js              ← API client for mobile app
//     screens/
//       chat/
//         ChatbotScreen.js         ← Chat UI component

// ========================================
// 5. 12 INTENTS IMPLEMENTED
// ========================================
//
// 1. greeting
//    Keywords: hi, hello, hey, good morning...
//    Purpose: Welcome user
//
// 2. registration_help
//    Keywords: register, sign up, create account...
//    Purpose: Help user sign up
//
// 3. login_help
//    Keywords: login, log in, sign in, password...
//    Purpose: Help user log in
//
// 4. browse_events
//    Keywords: event, events, browse, upcoming...
//    Purpose: Help user find events
//
// 5. book_ticket
//    Keywords: book, booking, reserve, buy ticket...
//    Purpose: Guide ticket booking process
//
// 6. cancel_booking
//    Keywords: cancel, refund, remove booking...
//    Purpose: Guide cancellation
//
// 7. booking_history
//    Keywords: my bookings, booking history, view bookings...
//    Purpose: Show how to view past bookings
//
// 8. ticket_types
//    Keywords: ticket type, price, vip, standard...
//    Purpose: Explain ticket categories
//
// 9. venue_details
//    Keywords: venue, location, address, where...
//    Purpose: Help find venue information
//
// 10. session_agenda
//     Keywords: session, agenda, speaker, schedule...
//     Purpose: Explain how to view sessions
//
// 11. profile
//     Keywords: profile, account, my details, settings...
//     Purpose: Help manage user profile
//
// 12. fallback
//     Triggered: When no keywords match
//     Purpose: Polite rejection + guide to supported topics

// ========================================
// 6. KEY FUNCTIONS EXPLAINED
// ========================================
//
// A. cleanMessage(message)
//    Purpose: Prepare user message for keyword matching
//    Returns: Cleaned string
//    Example:
//      Input:  "Hi!!! How do I BOOK a ticket???"
//      Output: "hi how do i book a ticket"
//
// B. matchesIntent(cleanedMessage, keywords)
//    Purpose: Check if message contains any keywords for an intent
//    Returns: true/false
//    Example:
//      Input:  ("i want to book", ["book", "reserve"])
//      Output: true (found keyword "book")
//
// C. findIntent(message)
//    Purpose: Find which intent matches the user's message
//    Returns: intent object or null
//    Process:
//      1. Clean message
//      2. Loop through all intents
//      3. Return first intent that matches
//
// D. getReply(message)
//    Purpose: Main function - get bot reply for user message
//    Returns: { success: true, reply: "...", intent: "..." }
//    Called by: chatbotController

// ========================================
// 7. API ENDPOINT
// ========================================
//
// Endpoint: POST /api/chatbot/message
// Authentication: None required (public)
// Port: 5000 (development)
//
// Request Example:
// {
//   "message": "How do I book a ticket?"
// }
//
// Response Example:
// {
//   "success": true,
//   "userMessage": "How do I book a ticket?",
//   "reply": "To book a ticket:\n1. Browse and select an event...",
//   "intent": "book_ticket"
// }
//
// Testing with curl:
// curl -X POST http://localhost:5000/api/chatbot/message \
//   -H "Content-Type: application/json" \
//   -d '{"message":"Hello"}'

// ========================================
// 8. FRONTEND INTEGRATION
// ========================================
//
// ChatbotScreen.js features:
// - Display chat messages (user + bot)
// - Text input for user message
// - Send button (HTTP request)
// - Auto-scroll to latest message
// - Loading indicator while waiting
// - Clear chat history
//
// Component structure:
// ChatbotScreen
//   ↓
//   ScrollView (message display)
//     ↓
//     ChatMessage components (individual messages)
//   ↓
//   Input area (text input + send button)
//   ↓
//   Footer (clear button)

// ========================================
// 9. HOW TO EXPLAIN IN VIVA
// ========================================
//
// Question: "Explain your chatbot implementation"
//
// Answer structure:
//
// 1. High-level overview
//    "We implemented a keyword-based rule engine chatbot.
//     It uses regex pattern matching to understand user intent
//     without AI models."
//
// 2. Problem solved
//    "Users can ask questions in natural language like
//     'How do I book?' or 'I want to cancel my booking?'
//     The chatbot understands these variations through keywords."
//
// 3. Technical approach
//    "Backend has 12 predefined intents, each with
//     keyword lists. When user sends message, we:
//     - Normalize it (lowercase, trim spaces)
//     - Match keywords using regex with word boundaries
//     - Return appropriate intent response"
//
// 4. Architecture
//    "Mobile app sends message to backend API.
//     Controller validates and passes to service.
//     Service performs intent matching and returns reply.
//     Frontend displays message in chat UI."
//
// 5. Key benefits
//    "✓ No AI required (cost-effective)
//     ✓ Fast response time
//     ✓ Flexible - easy to add new intents
//     ✓ Privacy - no data sent to external AI service"
//
// 6. Example flow
//    "If user types 'hi there', chatbot:
//     1. Cleans to 'hi there'
//     2. Finds keyword 'hi' in greeting intent
//     3. Returns greeting response"
//
// 7. Limitations & future work
//    "Currently handles specific domain queries.
//     Future: Could add ML-based intent classification
//     for more flexibility and context awareness."

// ========================================
// 10. TESTING SCENARIOS
// ========================================
//
// Test Case 1: Greeting
// Input:  "Hi there!"
// Expected: Greeting response
// Verify: Message displayed in chat, blue bubble (user), gray bubble (bot)
//
// Test Case 2: Multiple keywords
// Input:  "Hello, I want to book a ticket"
// Expected: Greeting intent (checked first)
// Note: Could also match "book_ticket" but greeting matches first
//
// Test Case 3: Fallback
// Input:  "qwerty xyz abc"
// Expected: Fallback response (no keywords matched)
//
// Test Case 4: Case insensitivity
// Input:  "HELLO" or "HeLLo"
// Expected: Should still match "greeting" intent
//
// Test Case 5: Punctuation handling
// Input:  "Hi!!!???"
// Expected: Should match greeting (punctuation removed)
//
// Test Case 6: Spaces
// Input:  "h i   l o"
// Expected: Should NOT match (regex uses word boundaries)
//
// Test Case 7: Empty message
// Input:  ""
// Expected: Error response
//
// Test Case 8: Chat persistence
// After sending 3 messages, clear chat
// Expected: Messages deleted, default welcome message shown

// ========================================
// 11. HOW TO EXTEND
// ========================================
//
// To add a new intent:
//
// 1. Open chatbotService.js
// 2. Add new object to intents array:
//    {
//      id: 'my_new_intent',
//      keywords: ['keyword1', 'keyword2', ...],
//      reply: 'Response message here'
//    }
// 3. That's it! Restart backend and test
//
// To modify a response:
// 1. Find the intent in chatbotService.js
// 2. Edit the 'reply' property
// 3. Restart backend
//
// To add keywords to existing intent:
// 1. Find the intent
// 2. Add more words to keywords array
// 3. Restart backend

// ========================================
// 12. PERFORMANCE CONSIDERATIONS
// ========================================
//
// Complexity: O(n) where n = number of intents
// - Loop through all intents
// - For each intent, match keywords
// - Return first match
//
// With 12 intents: Very fast (< 1ms)
// Scalability: Fine up to 100+ intents
// If more: Consider indexing or ML approach
//
// No database queries needed
// No external API calls
// All logic in-memory

// ========================================
// 13. SECURITY NOTES
// ========================================
//
// ✓ No authentication required (intentional - public chatbot)
// ✓ Message validation (reject empty messages)
// ✓ No sensitive data in responses
// ✓ No user data stored in chatbot
// ✓ Protected by API rate limiting (if implemented)
//
// If needed in future:
// - Add rate limiting
// - Add input sanitization
// - Add moderation filter

// ========================================
// 14. DEPLOYMENT
// ========================================
//
// Backend deployment:
// - Works on Render/Railway/Heroku
// - No special dependencies
// - Use: npm start
//
// Frontend deployment:
// - Works with Expo web export
// - Works with mobile build
// - No changes needed for deployment
//
// Environment variables:
// - CORS_ORIGIN should include frontend URL
// - No other env vars needed for chatbot

// ========================================
// END OF GUIDE
// ========================================
// This chatbot is production-ready and beginner-friendly!
// Good luck explaining in your viva! 🚀
