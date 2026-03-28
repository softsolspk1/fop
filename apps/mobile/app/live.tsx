import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  X, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Send, 
  Users, 
  MessageSquare, 
  LogOut,
  Shield,
  Zap
} from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function LiveSessionScreen() {
  const { id, courseId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const [agoraConfig, setAgoraConfig] = useState<any>(null);

  const scrollRef = useRef<ScrollView>(null);

  // Initial Join Data
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data } = await api.get(`/classes/${id}/join`);
        setAgoraConfig(data);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Could not join session.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, [id]);

  // Sync & Heartbeat
  useEffect(() => {
    let interval: any;
    if (isJoined) {
      const sync = async () => {
        try {
          const { data } = await api.get(`/classes/${id}/sync`);
          if (data.messages) setMessages(data.messages);
          if (data.participants) setParticipants(data.participants);
        } catch (e) {}
      };
      
      const heartbeat = async () => {
        try {
          await api.post(`/classes/${id}/heartbeat`, { agoraUid: agoraConfig?.uid });
        } catch (e) {}
      };

      sync();
      heartbeat();
      interval = setInterval(sync, 5000);
      return () => clearInterval(interval);
    }
  }, [isJoined, id, agoraConfig]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    const text = inputMessage;
    setInputMessage('');
    try {
      await api.post(`/classes/${id}/messages`, { content: text });
      setMessages([...messages, { sender: user?.name, text, time: new Date().toISOString() }]);
      setTimeout(() => scrollRef.current?.scrollToEnd(), 100);
    } catch (e) {
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  const handleLeave = () => {
    Alert.alert('Leave Session', 'Are you sure you want to disconnect?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: async () => {
          try { await api.post(`/classes/${id}/leave`); } catch(e){}
          router.back();
      }}
    ]);
  };

  if (loading) return (
     <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
     </View>
  );

  if (!isJoined) {
     return (
        <View style={styles.previewContainer}>
           <View style={styles.previewHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
                 <X size={24} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.previewTitle}>Lobby</Text>
              <View style={{ width: 44 }} />
           </View>
           
           <View style={styles.previewStage}>
              <View style={styles.stageIconBox}>
                 <VideoIcon size={48} color={Colors.white} opacity={0.5} />
              </View>
              <Text style={styles.stageStatus}>Preparing your connection...</Text>
           </View>

           <View style={styles.previewControls}>
              <View style={styles.controlRow}>
                 <TouchableOpacity 
                   onPress={() => setIsMicOn(!isMicOn)}
                   style={[styles.bigBtn, !isMicOn && styles.btnOff]}
                 >
                    {isMicOn ? <Mic size={28} color={Colors.white} /> : <MicOff size={28} color={Colors.white} />}
                 </TouchableOpacity>
                 <TouchableOpacity 
                   onPress={() => setIsCamOn(!isCamOn)}
                   style={[styles.bigBtn, !isCamOn && styles.btnOff]}
                 >
                    {isCamOn ? <VideoIcon size={28} color={Colors.white} /> : <VideoOff size={28} color={Colors.white} />}
                 </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.joinFullBtn}
                onPress={() => setIsJoined(true)}
              >
                 <Text style={styles.joinFullText}>Enter Classroom</Text>
                 <Zap size={20} color={Colors.white} />
              </TouchableOpacity>
           </View>
        </View>
     );
  }

  return (
    <View style={styles.container}>
      {/* Video Stage */}
      <View style={styles.stage}>
         <View style={styles.agoraPlaceholder}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.plaText}>Connecting to Video Stream...</Text>
         </View>
         
         <View style={styles.stageOverlay}>
            <View style={styles.liveBadge}>
               <View style={styles.liveDot} />
               <Text style={styles.liveText}>LIVE</Text>
            </View>
            <TouchableOpacity style={styles.pCount}>
               <Users size={14} color={Colors.white} />
               <Text style={styles.pText}>{participants.length}</Text>
            </TouchableOpacity>
         </View>

         <TouchableOpacity onPress={handleLeave} style={styles.leaveBtn}>
            <LogOut size={20} color={Colors.white} />
         </TouchableOpacity>
      </View>

      {/* Interactive Bottom Section */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.interactive}
      >
         <View style={styles.tabHeader}>
            <TouchableOpacity 
              onPress={() => setActiveTab('chat')}
              style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
            >
               <MessageSquare size={18} color={activeTab === 'chat' ? Colors.primary : Colors.textSecondary} />
               <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('participants')}
              style={[styles.tab, activeTab === 'participants' && styles.activeTab]}
            >
               <Users size={18} color={activeTab === 'participants' ? Colors.primary : Colors.textSecondary} />
               <Text style={[styles.tabText, activeTab === 'participants' && styles.activeTabText]}>People</Text>
            </TouchableOpacity>
         </View>

         {activeTab === 'chat' ? (
            <View style={styles.chatContainer}>
               <ScrollView 
                 ref={scrollRef}
                 style={styles.msgList}
                 contentContainerStyle={styles.msgScroll}
                 showsVerticalScrollIndicator={false}
               >
                  {messages.map((m, idx) => (
                    <View key={idx} style={styles.msgBox}>
                       <Text style={styles.msgSender}>{m.sender}</Text>
                       <View style={styles.msgBubble}>
                          <Text style={styles.msgText}>{m.text}</Text>
                       </View>
                    </View>
                  ))}
               </ScrollView>
               
               <View style={styles.inputRow}>
                  <TextInput 
                    style={styles.input}
                    placeholder="Say something..."
                    placeholderTextColor={Colors.textSecondary}
                    value={inputMessage}
                    onChangeText={setInputMessage}
                  />
                  <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                     <Send size={20} color={Colors.white} />
                  </TouchableOpacity>
               </View>
            </View>
         ) : (
            <ScrollView style={styles.pList}>
               {participants.map((p, idx) => (
                  <View key={idx} style={styles.pItem}>
                     <View style={styles.pAvatar}>
                        <Text style={styles.pAvatarText}>{p.name[0]}</Text>
                     </View>
                     <View style={styles.pInfo}>
                        <Text style={styles.pName}>{p.name}</Text>
                        <Text style={styles.pRole}>{p.role}</Text>
                     </View>
                     <View style={styles.onlineDot} />
                  </View>
               ))}
            </ScrollView>
         )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  previewContainer: { flex: 1, backgroundColor: '#0f172a', padding: 24 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 40 },
  circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  previewTitle: { color: Colors.white, fontSize: 18, fontWeight: '900' },
  previewStage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stageIconBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  stageStatus: { color: Colors.white, fontSize: 14, fontWeight: '600', opacity: 0.6 },
  previewControls: { paddingBottom: 40 },
  controlRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 32 },
  bigBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  btnOff: { backgroundColor: Colors.danger },
  joinFullBtn: { height: 64, backgroundColor: Colors.primary, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  joinFullText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  stage: { width: '100%', height: '40%', backgroundColor: '#000', position: 'relative' },
  agoraPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  plaText: { color: Colors.textSecondary, fontSize: 12, marginTop: 12, fontWeight: '700' },
  stageOverlay: { position: 'absolute', top: 20, left: 20, flexDirection: 'row', gap: 12 },
  liveBadge: { backgroundColor: Colors.danger, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.white },
  liveText: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  pCount: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pText: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  leaveBtn: { position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  interactive: { flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -32, padding: 24 },
  tabHeader: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  tab: { flex: 1, height: 48, borderRadius: 14, backgroundColor: Colors.slate50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  activeTab: { backgroundColor: Colors.primaryLight },
  tabText: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary },
  activeTabText: { color: Colors.primary },
  chatContainer: { flex: 1 },
  msgList: { flex: 1 },
  msgScroll: { paddingBottom: 20 },
  msgBox: { marginBottom: 16 },
  msgSender: { fontSize: 11, fontWeight: '900', color: Colors.primary, marginBottom: 4, textTransform: 'uppercase' },
  msgBubble: { backgroundColor: Colors.white, padding: 12, borderRadius: 16, borderTopLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  msgText: { fontSize: 14, color: Colors.text, lineHeight: 20, fontWeight: '500' },
  inputRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingTop: 12 },
  input: { flex: 1, height: 56, backgroundColor: Colors.slate50, borderRadius: 18, paddingHorizontal: 20, fontSize: 14, fontWeight: '600', color: Colors.text },
  sendBtn: { width: 56, height: 56, backgroundColor: Colors.primary, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  pList: { flex: 1 },
  pItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  pAvatarText: { color: Colors.primary, fontWeight: '900', fontSize: 18 },
  pInfo: { flex: 1 },
  pName: { fontSize: 15, fontWeight: '800', color: Colors.text },
  pRole: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
});
