import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, UserCheck, Video, Mic, ShieldCheck } from 'lucide-react-native';
import api from '../lib/api';

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
      console.error(error);
      Alert.alert('Error', 'Failed to mark attendance.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Channel: {channel || 'Standard'}</Text>
        </View>
      </View>

      {/* Video Mock/Placeholder */}
      <View style={styles.videoPlaceholder}>
        <Video size={64} color="rgba(255,255,255,0.3)" />
        <Text style={styles.videoText}>Connecting to Live Stream...</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn}>
          <Mic size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#ef4444' }]} onPress={() => router.back()}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Leave</Text>
        </TouchableOpacity>
      </View>

      {/* Attendance Section */}
      <View style={styles.attendanceCard}>
        <View style={styles.attendanceInfo}>
          <ShieldCheck size={24} color="#2563eb" />
          <View>
            <Text style={styles.attTitle}>Attendance Verification</Text>
            <Text style={styles.attSub}>Mark your presence for this session</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.markBtn, marked && styles.markedBtn]} 
          onPress={markAttendance}
          disabled={marking || marked}
        >
          {marking ? <ActivityIndicator color="#fff" /> : (
            <>
              <UserCheck size={20} color="#fff" />
              <Text style={styles.markBtnText}>{marked ? 'Attendance Marked' : 'Mark Attendance'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e293b' },
  header: { padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  backBtn: { padding: 8 },
  headerInfo: { marginLeft: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  videoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  videoText: { color: 'rgba(255,255,255,0.5)', marginTop: 16, fontSize: 14 },
  controls: { flexDirection: 'row', justifyContent: 'center', padding: 40, gap: 24, backgroundColor: 'rgba(0,0,0,0.5)' },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  attendanceCard: { margin: 24, padding: 20, backgroundColor: '#fff', borderRadius: 24 },
  attendanceInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  attTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  attSub: { fontSize: 12, color: '#64748b' },
  markBtn: { backgroundColor: '#2563eb', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  markedBtn: { backgroundColor: '#16a34a' },
  markBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
