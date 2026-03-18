import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { Bot, Send, Sparkles, User, ChevronLeft, BrainCircuit } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AITutorScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: `Hi ${user?.name}! I'm your AI Pharma-Tutor. Ask me anything about your pharmacy courses or lab experiments!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/tutor', { prompt: input });
      const assistantMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: "Sorry, I'm having trouble connecting. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
             <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
             <Text style={styles.headerTitle}>Pharma-Tutor AI</Text>
             <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Sparkles color="white" size={10} style={{ opacity: 0.7, marginRight: 4 }} /> 
                <Text style={styles.statusText}>Gemini Powered</Text>
             </View>
          </View>
          <View style={styles.headerBtn}>
             <BrainCircuit color="white" size={24} />
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 20, paddingTop: 20 }}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.msgWrapper, msg.role === 'user' ? styles.msgWrapperUser : styles.msgWrapperAssistant]}>
              {msg.role === 'assistant' && (
                <View style={[styles.avatar, styles.avatarAssistant]}>
                  <Bot color="white" size={16} />
                </View>
              )}
              <View 
                style={[
                  styles.msgBubble, 
                  msg.role === 'user' ? styles.msgBubbleUser : styles.msgBubbleAssistant
                ]}
              >
                <Text style={[styles.msgText, msg.role === 'user' ? styles.msgTextUser : styles.msgTextAssistant]}>
                  {msg.content}
                </Text>
              </View>
              {msg.role === 'user' && (
                 <View style={[styles.avatar, styles.avatarUser]}>
                    <User color="white" size={16} />
                 </View>
              )}
            </View>
          ))}
          {loading && (
            <View style={[styles.msgWrapper, styles.msgWrapperAssistant]}>
              <View style={[styles.avatar, styles.avatarAssistant]}>
                <Bot color="white" size={16} />
              </View>
              <View style={[styles.msgBubble, styles.msgBubbleAssistant, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingText}>Synthesizing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput 
              value={input}
              onChangeText={setInput}
              placeholder="Ask your Pharma-Tutor..."
              style={styles.input}
              placeholderTextColor="#cbd5e1"
              multiline
            />
            <TouchableOpacity 
              onPress={sendMessage}
              disabled={loading || !input.trim()}
              style={[
                styles.sendBtn, 
                (loading || !input.trim()) ? styles.sendBtnDisabled : styles.sendBtnEnabled
              ]}
            >
              <Send color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2563eb' },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    backgroundColor: '#2563eb', 
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { color: 'white', fontWeight: '900', fontSize: 18, textTransform: 'uppercase', letterSpacing: -0.5 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 6, height: 6, backgroundColor: '#4ade80', borderRadius: 3, marginRight: 6 },
  statusText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  chatArea: { flex: 1 },
  msgWrapper: { marginBottom: 20, flexDirection: 'row' },
  msgWrapperUser: { justifyContent: 'flex-end' },
  msgWrapperAssistant: { justifyContent: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  avatarAssistant: { backgroundColor: '#2563eb', marginRight: 12 },
  avatarUser: { backgroundColor: '#1e293b', marginLeft: 12 },
  msgBubble: { maxWidth: '80%', padding: 16, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  msgBubbleUser: { backgroundColor: '#1e293b', borderTopRightRadius: 2 },
  msgBubbleAssistant: { backgroundColor: 'white', borderTopLeftRadius: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  msgText: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  msgTextUser: { color: 'white' },
  msgTextAssistant: { color: '#334155' },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#94a3b8', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  inputArea: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 25, paddingLeft: 20, paddingRight: 6, paddingVertical: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  input: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '600', maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  sendBtnEnabled: { backgroundColor: '#2563eb' },
  sendBtnDisabled: { backgroundColor: '#cbd5e1' },
});
