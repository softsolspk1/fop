import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Video, Play, Clock, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';

export default function LiveScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeClasses, setActiveClasses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      setActiveClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setActiveClasses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClasses(); }} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Now</Text>
        {activeClasses && activeClasses.length > 0 ? (
            activeClasses.map(cls => (
                cls && (
                <TouchableOpacity 
                    key={cls.id} 
                    style={styles.activeCard}
                    onPress={() => router.push({
                        pathname: '/live-session',
                        params: { id: cls.id, title: cls.title, channel: cls.agoraChannel }
                    })}
                >
                    <View style={styles.liveBadge}>
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                    <Text style={styles.activeTitle}>{cls.title}</Text>
                    <Text style={styles.activeSub}>{cls.course?.name || 'Live Lecture'}</Text>
                    <View style={styles.btnRow}>
                        <TouchableOpacity 
                            style={styles.joinBtn}
                            onPress={() => router.push({
                                pathname: '/live-session',
                                params: { id: cls.id, title: cls.title, channel: cls.agoraChannel }
                            })}
                        >
                            <Play size={20} color="#fff" fill="#fff" />
                            <Text style={styles.joinText}>Join Session</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.attendanceBtn}
                            onPress={async () => {
                                try {
                                    await api.post(`/classes/${cls.id}/attendance`);
                                    alert('Attendance Marked!');
                                } catch (err) {
                                    alert('Failed to mark attendance');
                                }
                            }}
                        >
                            <Text style={styles.attendanceBtnText}>Mark Attendance</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                )
            ))
        ) : (
            <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No live classes at the moment</Text>
            </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        {[1, 2].map((i) => (
          <TouchableOpacity key={i} style={styles.recordedCard}>
            <View style={styles.recordedIcon}>
              <Clock size={20} color="#64748b" />
            </View>
            <View style={styles.recordedInfo}>
              <Text style={styles.recordedTitle}>Pharmacology Seminar</Text>
              <Text style={styles.recordedDate}>Tomorrow, 10:00 AM</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  activeCard: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, marginBottom: 16 },
  liveBadge: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  activeTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  activeSub: { color: '#94a3b8', fontSize: 14, marginBottom: 24 },
  btnRow: { flexDirection: 'row', gap: 12 },
  joinBtn: { flex: 1, backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8 },
  joinText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  attendanceBtn: { backgroundColor: '#fff', paddingHorizontal: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: '#e2e8f0' },
  attendanceBtnText: { color: '#1e293b', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  emptyCard: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  emptyText: { color: '#64748b', fontSize: 14 },
  recordedCard: { backgroundColor: '#fff', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  recordedIcon: { width: 44, height: 44, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recordedInfo: { flex: 1, marginLeft: 16 },
  recordedTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  recordedDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
