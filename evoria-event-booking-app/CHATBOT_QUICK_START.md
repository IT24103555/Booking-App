// ========================================
// CHATBOT INTEGRATION QUICK START
// ========================================
// Follow these steps to add the chatbot to your navigation

// ========================================
// STEP 1: Add Chat Screen to Navigation
// ========================================
// File: frontend/src/navigation/MainNavigator.js or AppNavigator.js
//
// Add import at top:
// import ChatbotScreen from '../screens/chat/ChatbotScreen';
//
// Add to Tab Navigator:
// <Tab.Screen
//   name="Chat"
//   component={ChatbotScreen}
//   options={{
//     title: 'Chatbot',
//     tabBarLabel: 'Chat',
//     tabBarIcon: ({ color, size }) => (
//       <Text style={{ fontSize: size, color }}>💬</Text>
//     ),
//   }}
// />

// ========================================
// STEP 2: Test the API (Backend)
// ========================================
//
// Make sure backend is running:
// npm start
//
// Test chatbot endpoint with curl:
// 
// curl -X POST http://localhost:5000/api/chatbot/message \
//   -H "Content-Type: application/json" \
//   -d '{"message":"Hello"}'
//
// Expected response:
// {
//   "success": true,
//   "userMessage": "Hello",
//   "reply": "👋 Hello! Welcome to Evoria Event Booking...",
//   "intent": "greeting"
// }

// ========================================
// STEP 3: Test with Mobile App
// ========================================
//
// 1. Start frontend: npm start (in frontend directory)
// 2. Open app on web: http://localhost:8084
// 3. Look for "Chat" tab
// 4. Try typing: "How do I book a ticket?"
// 5. Chatbot should respond with booking instructions

// ========================================
// STEP 4: TEST SCENARIOS
// ========================================
//
// Test these phrases to verify chatbot works:
//
// Input: "hi"
// Expected: Greeting response
//
// Input: "I want to book"
// Expected: Booking instructions
//
// Input: "how do I cancel"
// Expected: Cancellation help
//
// Input: "show my bookings"
// Expected: How to view booking history
//
// Input: "what's the price"
// Expected: Ticket types explanation
//
// Input: "xyz qwerty"
// Expected: Fallback response

// ========================================
// STEP 5: VERIFY FEATURES
// ========================================
//
// ✓ Chat messages display correctly (user right, bot left)
// ✓ Input field accepts text
// ✓ Send button works
// ✓ Loading indicator shows while processing
// ✓ Auto-scroll to latest message
// ✓ Clear chat button works
// ✓ Empty message shows error
// ✓ Multiple messages stack in conversation

// ========================================
// STEP 6: CUSTOMIZE RESPONSES (Optional)
// ========================================
//
// To change bot responses:
// 1. Open: backend/src/services/chatbotService.js
// 2. Find the intent you want to modify
// 3. Edit the 'reply' property
// 4. Restart backend: npm start
//
// Example: Change greeting message
// Before:
//   reply: '👋 Hello! Welcome to Evoria...'
// After:
//   reply: '👋 Hi there! How can I help you book events?'

// ========================================
// STEP 7: ADD NEW INTENTS (Optional)
// ========================================
//
// To add support for new questions:
// 1. Open: backend/src/services/chatbotService.js
// 2. Add new object to intents array:
//
// {
//   id: 'payment_help',
//   keywords: ['payment', 'card', 'payment method', 'how to pay'],
//   reply: 'We accept:\n- Credit/Debit Cards\n- Mobile Money\n- Pay at Venue\n\nChoose your preferred method at checkout!',
// },
//
// 3. Restart backend
// 4. Test with: "How do I pay?"

// ========================================
// TROUBLESHOOTING
// ========================================
//
// Problem: Chatbot endpoint returns error
// Solution: Make sure backend is running (npm start)
// Check: http://localhost:5000/api/chatbot/message
//
// Problem: Chat screen not appearing in navigation
// Solution: Add ChatbotScreen to MainNavigator.js
// Import: import ChatbotScreen from '../screens/chat/ChatbotScreen';
//
// Problem: Message not sending
// Solution: Check browser console for errors
// Verify: Internet connection to backend
// Check: CORS settings in backend/src/server.js
//
// Problem: Empty message shows no error
// Solution: This is expected - try typing something
//
// Problem: Chatbot keeps saying fallback response
// Solution: Keywords might not match
// Add your phrase to an existing intent's keywords
// Or create a new intent for your use case

// ========================================
// FILES CREATED
// ========================================
//
// Backend:
// ✓ backend/src/services/chatbotService.js
// ✓ backend/src/controllers/chatbotController.js
// ✓ backend/src/routes/chatbotRoutes.js
// ✓ Modified: backend/src/server.js (added chatbot route)
//
// Frontend:
// ✓ frontend/src/api/chatbotApi.js
// ✓ frontend/src/screens/chat/ChatbotScreen.js
//
// Documentation:
// ✓ CHATBOT_GUIDE.md (comprehensive guide for viva)

// ========================================
// NEXT STEPS
// ========================================
//
// 1. Add ChatbotScreen to your navigation
// 2. Test backend API with curl
// 3. Test in mobile app
// 4. Customize responses if needed
// 5. Read CHATBOT_GUIDE.md for detailed explanations
// 6. Practice explaining the implementation

// ========================================
// ARCHITECTURE SUMMARY
// ========================================
//
// User sends message
//        ↓
// ChatbotScreen.js (React Native UI)
//        ↓
// chatbotApi.sendMessage() (HTTP POST)
//        ↓
// Backend POST /api/chatbot/message
//        ↓
// chatbotController.sendMessage()
//        ↓
// chatbotService.getReply()
//        ↓
// Intent matching with keywords
//        ↓
// Return bot reply
//        ↓
// Display in ChatbotScreen.js
//
// Flow is simple and linear - easy to debug!

// ========================================
// READY TO DEPLOY!
// ========================================
// 
// Your keyword-based chatbot is production-ready!
// No special configuration needed.
// Works on Render, Railway, or any Node.js host.
// Works with Expo web and native mobile builds.
//
// Good luck with your app! 🚀
