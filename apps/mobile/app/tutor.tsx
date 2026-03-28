import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { Bot, Send, Sparkles, User, ChevronLeft, BrainCircuit } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Card } from '../components/UI';

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
  safeArea: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    backgroundColor: Colors.primary, 
    paddingBottom: 24, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { color: Colors.white, fontWeight: '900', fontSize: 18, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusDot: { width: 8, height: 8, backgroundColor: '#10b981', borderRadius: 4, marginRight: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  chatArea: { flex: 1 },
  msgWrapper: { marginBottom: 24, flexDirection: 'row' },
  msgWrapperUser: { justifyContent: 'flex-end' },
  msgWrapperAssistant: { justifyContent: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  avatarAssistant: { backgroundColor: Colors.primary, marginRight: 12 },
  avatarUser: { backgroundColor: Colors.text, marginLeft: 12 },
  msgBubble: { maxWidth: '80%', padding: 18, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  msgBubbleUser: { backgroundColor: Colors.text, borderTopRightRadius: 4, shadowColor: Colors.text },
  msgBubbleAssistant: { backgroundColor: Colors.white, borderTopLeftRadius: 4, borderWidth: 1, borderColor: Colors.slate50 },
  msgText: { fontSize: 15, lineHeight: 24, fontWeight: '600', letterSpacing: -0.2 },
  msgTextUser: { color: Colors.white },
  msgTextAssistant: { color: Colors.text },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  inputArea: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 15, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.slate50 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.slate50, borderRadius: 28, paddingLeft: 20, paddingRight: 8, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, fontSize: 16, color: Colors.text, fontWeight: '700', maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 },
  sendBtnEnabled: { backgroundColor: Colors.primary },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
