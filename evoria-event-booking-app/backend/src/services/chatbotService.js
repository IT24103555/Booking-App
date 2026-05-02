// ========================================
// CHATBOT SERVICE - Intent Matching Logic
// ========================================
// This service handles all chatbot conversation logic.
// It matches user messages to intents and generates appropriate replies.
// Strategy: Use keyword matching to understand what the user wants.

// ========================================
// DEFINE ALL INTENTS WITH THEIR KEYWORDS
// ========================================
// Each intent has:
// - id: unique identifier
// - keywords: array of words/phrases to match
// - reply: response message to send back

const intents = [
  {
    // Greeting intent: When user says hi/hello/hey
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'howdy', 'greetings'],
    reply: '👋 Hello! Welcome to Evoria Event Booking. I can help you with events, bookings, tickets, venues, and more. What would you like to do today?',
  },
  {
    // Registration help: When user wants to create an account
    id: 'registration_help',
    keywords: ['register', 'sign up', 'create account', 'new account', 'signup', 'join', 'membership'],
    reply: '📝 To register:\n1. Tap "Sign Up" on the login screen\n2. Enter your name, email, and phone\n3. Create a secure password\n4. Verify your email\n5. You\'re ready to book!\n\nNeed more help?',
  },
  {
    // Login help: When user cannot access their account
    id: 'login_help',
    keywords: ['login', 'log in', 'sign in', 'access account', 'password', 'forgot password', 'can\'t login'],
    reply: '🔐 To log in:\n1. Enter your email and password\n2. Tap "Sign In"\n\nForgot your password?\n- Tap "Forgot Password" on login screen\n- Enter your email\n- Check your email for reset link\n\nStill having issues? Contact support.',
  },
  {
    // Browse events: When user wants to see available events
    id: 'browse_events',
    keywords: ['event', 'events', 'browse', 'upcoming', 'available events', 'show events', 'list events', 'search events'],
    reply: '🎫 Great! You can browse events by:\n1. Go to the "Events" tab\n2. View all upcoming events\n3. Tap any event to see details\n4. Check available ticket types and prices\n5. Ready to book?\n\nWhat type of event interests you?',
  },
  {
    // Book ticket: When user wants to make a reservation
    id: 'book_ticket',
    keywords: ['book', 'booking', 'reserve', 'reservation', 'buy ticket', 'purchase', 'get ticket', 'book ticket'],
    reply: '🎟️ To book a ticket:\n1. Browse and select an event\n2. Choose ticket type (Standard, VIP, etc.)\n3. Enter quantity\n4. Select payment method\n5. Enter payment details\n6. Confirm booking\n\nYou\'ll receive a confirmation with your booking ID.\n\nWhich event would you like to book?',
  },
  {
    // Cancel booking: When user wants to cancel a reservation
    id: 'cancel_booking',
    keywords: ['cancel', 'cancel booking', 'remove booking', 'refund', 'booking cancel', 'undo booking', 'delete booking'],
    reply: '❌ To cancel a booking:\n1. Go to "My Bookings"\n2. Find the booking you want to cancel\n3. Tap the booking\n4. Tap "Cancel Booking"\n5. Confirm cancellation\n\nRefunds are processed within 3-5 business days.\n\nNeed to cancel a specific booking?',
  },
  {
    // Booking history: When user wants to see past bookings
    id: 'booking_history',
    keywords: ['my bookings', 'booking history', 'previous bookings', 'view bookings', 'past bookings', 'bookings', 'history'],
    reply: '📋 To view your booking history:\n1. Tap the menu icon\n2. Go to "My Bookings"\n3. See all your bookings with status\n4. View confirmed, pending, and cancelled bookings\n5. Tap any booking for details\n\nNeed help with a specific booking?',
  },
  {
    // Ticket types: When user asks about ticket categories and pricing
    id: 'ticket_types',
    keywords: ['ticket type', 'ticket price', 'price', 'vip', 'standard', 'available tickets', 'ticket category', 'pricing'],
    reply: '🎫 Ticket types vary by event:\n- **Standard**: General admission\n- **VIP**: Premium seating & perks\n- **Student**: Discounted rate with ID\n- **Group**: Special group rates\n\nPrices depend on the event. View an event to see all available ticket types and their prices.\n\nWhich event are you interested in?',
  },
  {
    // Venue details: When user wants to know location information
    id: 'venue_details',
    keywords: ['venue', 'location', 'address', 'place', 'where', 'directions', 'venue location', 'venue address'],
    reply: '📍 To find venue details:\n1. Browse and select an event\n2. Scroll to "Venue Information"\n3. See venue name and address\n4. Tap to view full directions\n5. Get parking and access info\n\nEach event page shows the exact venue location.\n\nWhich event are you asking about?',
  },
  {
    // Session agenda: When user wants to know event schedule/speakers
    id: 'session_agenda',
    keywords: ['session', 'agenda', 'speaker', 'schedule', 'time', 'timing', 'when', 'event schedule', 'speakers'],
    reply: '📅 To view session details:\n1. Select an event\n2. Scroll to "Session Agenda"\n3. See all sessions with times\n4. View speaker names and descriptions\n5. Session times help you plan!\n\nEvent schedules are always on the event details page.\n\nWhich event\'s schedule do you need?',
  },
  {
    // Profile: When user wants to manage their account
    id: 'profile',
    keywords: ['profile', 'account', 'my details', 'update profile', 'edit profile', 'settings', 'account settings', 'my account'],
    reply: '👤 To manage your profile:\n1. Tap the menu icon\n2. Go to "Profile"\n3. View your name, email, phone\n4. Tap "Edit" to update information\n5. Save changes\n\nKeep your profile updated for better support!\n\nNeed help with something specific?',
  },
];

// ========================================
// HELPER FUNCTION: Clean user message
// ========================================
// Purpose: Prepare the user message for keyword matching
// Steps:
// 1. Convert to lowercase (so "Hello" = "hello")
// 2. Remove extra spaces
// 3. Remove punctuation (so "Hello?" = "hello")

function cleanMessage(message) {
  // Convert to lowercase
  let cleaned = String(message || '').toLowerCase();

  // Remove extra spaces (multiple spaces to single space)
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Remove common punctuation
  cleaned = cleaned.replace(/[.,!?;:]/g, '');

  return cleaned;
}

// ========================================
// HELPER FUNCTION: Match keywords
// ========================================
// Purpose: Check if user message contains any keywords for an intent
// Strategy:
// - For each keyword, check if it's in the message
// - Use word boundaries to avoid partial matches
// - Example: "hi" matches "hi", but not in "high"

function matchesIntent(cleanedMessage, keywords) {
  // Loop through each keyword
  for (let keyword of keywords) {
    // Create a regex pattern with word boundaries
    // \b means "word boundary" - ensures whole word matching
    // 'i' flag means case-insensitive (but we already lowercased)
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');

    // If the message contains this keyword, it's a match!
    if (pattern.test(cleanedMessage)) {
      return true;
    }
  }

  // No keywords found
  return false;
}

// ========================================
// MAIN FUNCTION: Match user message to intent
// ========================================
// Purpose: Find which intent the user message belongs to
// Return: The matching intent object or null

function findIntent(message) {
  // Step 1: Clean the message
  const cleanedMessage = cleanMessage(message);

  // Step 2: Check each intent's keywords
  for (let intent of intents) {
    // Does this message match any of this intent's keywords?
    if (matchesIntent(cleanedMessage, intent.keywords)) {
      // Found a match! Return the intent
      return intent;
    }
  }

  // Step 3: If no intent matched, return null
  return null;
}

// ========================================
// MAIN FUNCTION: Process chatbot message
// ========================================
// Purpose: Take user message and return bot reply
// Steps:
// 1. Clean the message
// 2. Find matching intent
// 3. Return appropriate reply

function getReply(message) {
  // Find which intent this message matches
  const intent = findIntent(message);

  // If we found an intent, return its reply
  if (intent) {
    return {
      success: true,
      reply: intent.reply,
      intent: intent.id, // Optional: helpful for debugging
    };
  }

  // If no intent matched, return fallback reply
  return {
    success: true,
    reply: "😊 Sorry, I can help only with Evoria event booking features such as events, tickets, venues, bookings, and sessions. Try asking about 'events', 'bookings', 'tickets', or 'venues'!",
    intent: 'fallback',
  };
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
// Export so other files can use these functions

module.exports = {
  getReply,
  findIntent,
  cleanMessage,
  matchesIntent,
  intents,
};
