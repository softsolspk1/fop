import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, ChevronLeft, MoreVertical, Phone, Video } from 'lucide-react-native';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Card } from '../components/UI';

export default function ChatThreadScreen() {
  const router = useRouter();
  const { partnerId, groupId, name } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/messages', {
        params: { partnerId, groupId }
      });
      setMessages(data);
      if (loading) setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }, [partnerId, groupId, loading]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async () => {
    if (!content.trim()) return;
    const pendingText = content;
    setContent('');
    try {
      const { data } = await api.post('/chat/send', {
        content: pendingText,
        receiverId: partnerId,
        groupId
      });
      setMessages((prev) => [...prev, data]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error(error);
      setContent(pendingText);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
           <Text style={styles.title} numberOfLines={1}>{name}</Text>
           <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Active Now</Text>
           </View>
        </View>
        <View style={styles.headerActions}>
           <TouchableOpacity style={styles.hAction}>
              <Phone size={20} color={Colors.textSecondary} />
           </TouchableOpacity>
           <TouchableOpacity style={styles.hAction}>
              <MoreVertical size={20} color={Colors.textSecondary} />
           </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
            const isMe = item.senderId === user?.id || item.senderId === user?.userId;
            return (
                <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
                    {!isMe && groupId && <Text style={styles.senderName}>{item.sender?.name}</Text>}
                    <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                            {item.content}
                        </Text>
                    </View>
                    <Text style={styles.time}>
                       {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            );
        }}
        keyExtractor={item => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <Card style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={Colors.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !content.trim() && styles.sendDisabled]} 
          onPress={sendMessage}
          disabled={!content.trim()}
        >
          <Send size={20} color={Colors.white} />
        </TouchableOpacity>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 44, height: 44, backgroundColor: Colors.slate50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  headerInfo: { flex: 1 },
  title: { fontSize: 18, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  statusText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  hAction: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20, paddingBottom: 40 },
  messageRow: { marginBottom: 20, maxWidth: '85%' },
  myMessageRow: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherMessageRow: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { fontSize: 10, fontWeight: '800', color: Colors.primary, marginBottom: 4, marginLeft: 12, textTransform: 'uppercase' },
  bubble: { padding: 14, borderRadius: 20 },
  myBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  otherBubble: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  messageText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  myMessageText: { color: Colors.white },
  otherMessageText: { color: Colors.text },
  time: { fontSize: 10, fontWeight: '600', color: Colors.border, marginTop: 6, marginHorizontal: 4 },
  inputContainer: { margin: 16, marginBottom: Platform.OS === 'ios' ? 40 : 20, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 24 },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: Colors.text, maxHeight: 120 },
  sendBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  sendDisabled: { opacity: 0.5, backgroundColor: Colors.border },
});
