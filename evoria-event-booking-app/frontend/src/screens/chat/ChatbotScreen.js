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

const UI = { primary: '#EC168C', purple: '#7C3AED', background: '#FFF7FC', surface: '#FFFFFF', text: '#111827', muted: '#7C7C8A', border: '#F0DDEB', softPink: '#FFE7F4' };

function ChatMessage({ item }) {
  const isUser = !!item.isUser;
  return (
    <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
      {!isUser ? <View style={styles.botAvatar}><Text style={styles.botAvatarText}>✦</Text></View> : null}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>{item.text}</Text>
        <Text style={[styles.messageTime, isUser ? styles.userTime : styles.botTime]}>{item.time || ''}</Text>
      </View>
    </View>
  );
}

export default function ChatbotScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! 👋 How can I help you today? Ask me about events, tickets, venues, bookings, or sessions.', isUser: false, time: 'Now' },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const onSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMessage = inputText.trim();
    setInputText('');
    setMessages((prev) => [{ id: Date.now(), text: userMessage, isUser: true, time: 'Now' }, ...prev]);
    try {
      setLoading(true);
      const response = await chatbotApi.sendMessage(userMessage);
      setMessages((prev) => [{ id: Date.now() + 1, text: response.reply || 'Sorry, I could not retrieve an answer right now.', isUser: false, time: 'Now' }, ...prev]);
    } catch (e) {
      const message = getErrorMessage(e) || 'Network error. Please check your connection.';
      setMessages((prev) => [{ id: Date.now() + 2, text: `I’m having trouble reaching the server. ${message}`, isUser: false, time: 'Now' }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current) setTimeout(() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
  }, [messages]);

  const onClearChat = () => {
    Alert.alert('Clear chat?', 'This will delete all chat messages.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setMessages([{ id: 1, text: 'Hello! 👋 How can I help you today?', isUser: false, time: 'Now' }]) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleButton}><Text style={styles.circleButtonText}>‹</Text></TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Evoria Assistant</Text>
            <View style={styles.onlineRow}><View style={styles.onlineDot} /><Text style={styles.onlineText}>Online</Text></View>
          </View>
          <TouchableOpacity onPress={onClearChat} style={styles.circleButton}><Text style={styles.clearText}>⌫</Text></TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ChatMessage item={item} />}
          inverted
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={loading ? <View style={styles.typingRow}><ActivityIndicator size="small" color={UI.primary} /><Text style={styles.typingText}>Evoria Assistant is typing...</Text></View> : null}
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={UI.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxHeight={90}
            editable={!loading}
          />
          <TouchableOpacity style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]} onPress={onSendMessage} disabled={loading || !inputText.trim()} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>➤</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background },
  container: { flex: 1, backgroundColor: UI.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: UI.border },
  circleButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: UI.softPink, alignItems: 'center', justifyContent: 'center' },
  circleButtonText: { color: UI.text, fontSize: 28, lineHeight: 28, fontWeight: '900' },
  clearText: { color: UI.primary, fontSize: 20, fontWeight: '900' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: UI.text, fontSize: 17, fontWeight: '900' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  onlineText: { color: '#10B981', fontSize: 12, fontWeight: '800' },
  messagesList: { paddingHorizontal: 16, paddingVertical: 18 },
  messageRow: { marginVertical: 8, flexDirection: 'row', alignItems: 'flex-end' },
  messageRowUser: { justifyContent: 'flex-end', paddingLeft: 48 },
  messageRowBot: { justifyContent: 'flex-start', paddingRight: 44 },
  botAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: UI.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  botAvatarText: { color: '#fff', fontWeight: '900' },
  messageBubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 18 },
  userBubble: { backgroundColor: UI.purple, borderBottomRightRadius: 5 },
  botBubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: UI.border, borderBottomLeftRadius: 5 },
  messageText: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  userText: { color: '#fff' },
  botText: { color: UI.text },
  messageTime: { fontSize: 10, marginTop: 6, fontWeight: '700' },
  userTime: { color: 'rgba(255,255,255,0.72)', textAlign: 'right' },
  botTime: { color: UI.muted },
  typingRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: UI.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 8 },
  typingText: { color: UI.muted, fontSize: 12, fontWeight: '700' },
  inputArea: { flexDirection: 'row', padding: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: UI.border, gap: 10, alignItems: 'flex-end' },
  input: { flex: 1, minHeight: 48, maxHeight: 90, borderRadius: 18, paddingHorizontal: 15, paddingVertical: 12, fontSize: 14, color: UI.text, backgroundColor: '#F8F2F7', fontWeight: '600' },
  sendButton: { width: 50, height: 50, borderRadius: 18, backgroundColor: UI.primary, justifyContent: 'center', alignItems: 'center', shadowColor: UI.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 8 },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { color: '#fff', fontWeight: '900', fontSize: 19 },
});
