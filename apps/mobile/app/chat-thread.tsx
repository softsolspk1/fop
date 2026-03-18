import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, ChevronLeft } from 'lucide-react-native';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ChatThreadScreen() {
  const router = useRouter();
  const { partnerId, groupId, name } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/chat/messages', {
        params: { partnerId, groupId }
      });
      setMessages(data);
      if (loading) setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!content.trim()) return;
    try {
      const { data } = await api.post('/chat/send', {
        content,
        receiverId: partnerId,
        groupId
      });
      setMessages([...messages, data]);
      setContent('');
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{name}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
            const isMe = item.senderId === user?.userId;
            return (
                <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
                    {!isMe && groupId && <Text style={styles.senderName}>{item.sender.name}</Text>}
                    <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                            {item.content}
                        </Text>
                    </View>
                    <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
            );
        }}
        keyExtractor={item => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={content}
          onChangeText={setContent}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { marginRight: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  list: { padding: 16 },
  messageRow: { marginBottom: 16, maxWidth: '80%' },
  myMessageRow: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherMessageRow: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { fontSize: 10, color: '#64748b', marginBottom: 4, marginLeft: 12 },
  bubble: { padding: 12, borderRadius: 20 },
  myBubble: { backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: '#f1f5f9', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15 },
  myMessageText: { color: '#fff' },
  otherMessageText: { color: '#1e293b' },
  time: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  inputContainer: { padding: 16, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 12 },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
});
