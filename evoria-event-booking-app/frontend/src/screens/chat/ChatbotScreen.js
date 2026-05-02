import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { chatbotApi } from '../../api/chatbotApi';
import { getErrorMessage } from '../../api/apiClient';
import ErrorMessage from '../../components/ErrorMessage';
import { colors } from '../../constants/colors';

// ========================================
// CHATBOT MESSAGE COMPONENT
// ========================================
// This component displays a single message in the chat
// Messages can be from user or bot
// Styling is different for each (user right, bot left)

function ChatMessage({ item }) {
  // item: { id, text, isUser }
  const isUser = !!item.isUser;
  return (
    <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>{item.text}</Text>
      </View>
    </View>
  );
}

// ========================================
// MAIN CHATBOT SCREEN
// ========================================
// This screen displays a chat interface where users can talk to the chatbot
// Features:
// - Message history
// - Text input
// - Send button
// - Auto-scroll to latest message
// - Loading indicator while waiting for response

export default function ChatbotScreen() {
  // ========================================
  // STATE VARIABLES
  // ========================================
  
  // messages: array of chat messages
  // Each message: { id, text, isUser: true/false }
  const navigation = useNavigation();

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '👋 Hi there — I\'m Evoria Assistant. Ask me about events, bookings, tickets, venues, or your profile.',
      isUser: false,
    },
  ]);

  // Current text in input field
  const [inputText, setInputText] = useState('');

  // Is chatbot processing a message?
  const [loading, setLoading] = useState(false);

  // Error message to display
  const [error, setError] = useState('');

  // Reference to scroll view (to auto-scroll)
  const flatListRef = useRef(null);

  // ========================================
  // FUNCTION: Send message to chatbot
  // ========================================
  // Steps:
  // 1. Validate input (not empty)
  // 2. Add user message to chat
  // 3. Send to backend
  // 4. Add bot response to chat
  // 5. Clear input field

  const onSendMessage = async () => {
    // Check if input is not empty
    if (!inputText.trim()) {
      setError('Please type a message');
      return;
    }

    // Clear previous error
    setError('');

    // Store the message text
    const userMessage = inputText.trim();

    // Clear input field
    setInputText('');

    // Add user message to chat (optimistic)
    const userMessageId = Date.now();
    const newUserMessage = { id: userMessageId, text: userMessage, isUser: true };
    setMessages((prev) => [newUserMessage, ...prev]);

    try {
      // Show loading indicator
      setLoading(true);

      // Send message to chatbot backend
      const response = await chatbotApi.sendMessage(userMessage);

      // Check if response was successful
      if (response.success) {
        const botMessage = { id: Date.now() + 1, text: response.reply, isUser: false };
        setMessages((prev) => [botMessage, ...prev]);
      } else {
        // Add friendly error message from bot
        const botMessage = { id: Date.now() + 2, text: response.reply || 'Sorry, I could not retrieve an answer right now.', isUser: false };
        setMessages((prev) => [botMessage, ...prev]);
      }
    } catch (e) {
      // Network or unexpected error — show friendly bot message + set error for UI
      const message = getErrorMessage(e) || 'Network error. Please check your connection.';
      setError(message);
      const botMessage = { id: Date.now() + 3, text: 'I\'m having trouble reaching the server. Please try again later.', isUser: false };
      setMessages((prev) => [botMessage, ...prev]);
    } finally {
      // Hide loading indicator
      setLoading(false);
    }
  };

  // ========================================
  // EFFECT: Auto-scroll to latest message
  // ========================================
  // Whenever a new message is added, scroll to bottom
  // so user always sees the latest message

  // Auto-scroll: FlatList is inverted, new messages are at top of data array
  useEffect(() => {
    // Give a small delay then scroll to top (inverted list shows newest at top)
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 120);
    }
  }, [messages]);

  // ========================================
  // FUNCTION: Clear chat history
  // ========================================

  const onClearChat = () => {
    Alert.alert(
      'Clear chat?',
      'This will delete all messages. Are you sure?',
      [
        { text: 'Cancel' },
        {
          text: 'Clear',
          onPress: () => {
            setMessages([
              {
                id: 1,
                text: '👋 Hi there — I\'m Evoria Assistant. Ask me about events, bookings, tickets, venues, or your profile.',
                isUser: false,
              },
            ]);
            setError('');
          },
        },
      ]
    );
  };

  // ========================================
  // RENDER: Main UI
  // ========================================

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Evoria Assistant</Text>
          <TouchableOpacity onPress={onClearChat} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Messages list - inverted so newest appear at bottom visually */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ChatMessage item={item} />}
          inverted
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
        />

        {error ? <ErrorMessage message={error} /> : null}

        {/* Input area */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about events, bookings, tickets..."
            placeholderTextColor={colors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxHeight={100}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.sendButton, (inputText.trim() === '' || loading) && styles.sendButtonDisabled]}
            onPress={onSendMessage}
            disabled={loading || inputText.trim() === ''}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>✈️</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Messages list container for FlatList
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  // Message row positions bubble left or right
  messageRow: {
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
    paddingLeft: 40,
  },
  messageRowBot: {
    justifyContent: 'flex-start',
    paddingRight: 40,
  },

  // Message bubble (the actual message box)
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },

  // User message style (primary color)
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },

  // Bot message style (light card)
  botBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },

  // Message text
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },

  // User message text (white)
  userText: {
    color: '#fff',
  },

  // Bot message text (dark)
  botText: {
    color: colors.text,
  },

  // Header
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#fff',
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerButtonText: { color: colors.primary, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },

  // Input area (bottom section)
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#fff',
    gap: 8,
    alignItems: 'flex-end',
  },

  // Text input field
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
    color: colors.text,
  },

  // Send button
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: colors.muted,
    opacity: 0.5,
  },

  // Send button text
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  // Footer with clear button
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },

  // Clear chat button
  clearButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },

  clearButtonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});
