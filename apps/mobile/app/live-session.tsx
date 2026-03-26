import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, UserCheck, Video, Mic, ShieldCheck, Monitor, Edit3 } from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card, Button } from '../components/UI';

export default function LiveSessionScreen() {
  const router = useRouter();
  const { id, title, channel } = useLocalSearchParams();
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);

  const markAttendance = async () => {
    setMarking(true);
    try {
      await api.post('/attendance/self-mark', { classId: id });
      setMarked(true);
      Alert.alert('Success', 'Attendance marked successfully!');
    } catch (error) {
      console.error('[Attendance Error]:', error);
      Alert.alert('Error', 'Failed to mark attendance. Please try again.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Premium Video Header */}
      <View style={styles.videoContainer}>
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.sessionTitle} numberOfLines={1}>{title || 'Live Session'}</Text>
            <Text style={styles.sessionChannel}>Channel: {channel || 'Standard'}</Text>
          </View>
        </View>

        <View style={styles.videoPlaceholder}>
          <Video size={64} color="rgba(255,255,255,0.2)" />
          <Text style={styles.videoText}>Connecting to Secure Link...</Text>
          <ActivityIndicator color={Colors.white} style={{ marginTop: 20 }} />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn}>
            <Mic size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlBtn} 
            onPress={() => Alert.alert('Feature', 'Screen Sharing is currently restricted to Web portal.')}
          >
            <Monitor size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlBtn} 
            onPress={() => Alert.alert('Feature', 'Interactive Whiteboard is currently restricted to Web portal.')}
          >
            <Edit3 size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlBtn, { backgroundColor: Colors.danger }]} 
            onPress={() => router.back()}
          >
            <Text style={styles.leaveBtnText}>Leave</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Card style={styles.attendanceCard}>
          <View style={styles.attHeader}>
            <View style={[styles.attIconBox, { backgroundColor: Colors.primary + '10' }]}>
              <ShieldCheck size={28} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.attTitle}>Attendance Verification</Text>
              <Text style={styles.attDesc}>Verify your presence for this credit hour</Text>
            </View>
          </View>

          <Button 
            title={marked ? "Attendance Verified" : "Mark My Attendance"}
            icon={UserCheck}
            onPress={markAttendance}
            loading={marking}
            style={[styles.markBtn, marked && { backgroundColor: Colors.success }]}
            disabled={marked}
          />
        </Card>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Quick Tips</Text>
          <View style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>Keep the app open during the entire session.</Text>
          </View>
          <View style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>Use a stable Wi-Fi connection for best quality.</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  videoContainer: { height: '55%', backgroundColor: '#0f172a', position: 'relative' },
  headerOverlay: { 
    position: 'absolute', 
    top: 60, 
    left: 24, 
    right: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    zIndex: 10 
  },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  sessionTitle: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
  sessionChannel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },
  videoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  videoText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 16, fontWeight: '500' },
  controls: { 
    position: 'absolute', 
    bottom: 30, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 20 
  },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  leaveBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: 12 },
  content: { flex: 1, padding: 24, marginTop: -32, backgroundColor: Colors.background, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  attendanceCard: { padding: 24 },
  attHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  attIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  attTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  attDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  markBtn: { height: 64 },
  tipsSection: { marginTop: 32 },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  tipText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
});
