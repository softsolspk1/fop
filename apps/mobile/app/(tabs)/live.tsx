import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Video, Play, Clock, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';
import { Colors, Card, Button } from '../../components/UI';

export default function LiveScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeClasses, setActiveClasses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      setActiveClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[Live Fetch Error]:', error);
      setActiveClasses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Live Sessions</Text>
        <Text style={styles.subtitle}>Join your ongoing lectures</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Now</Text>
        {activeClasses.length > 0 ? (
          activeClasses.map(cls => (
            <Card key={cls.id} style={styles.activeCard}>
              <View style={styles.liveBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              
              <Text style={styles.activeTitle}>{cls.title}</Text>
              <Text style={styles.activeSub}>{cls.course?.name || 'Live Lecture'}</Text>
              
              <View style={styles.btnRow}>
                <Button 
                  title="Join Session"
                  icon={Play}
                  onPress={() => router.push({
                    pathname: '/live-session',
                    params: { id: cls.id, title: cls.title, channel: cls.agoraChannel }
                  })}
                  style={styles.joinBtn}
                />
                
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
                  <ShieldCheck size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Video size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No live classes at the moment</Text>
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Today</Text>
        {[1, 2].map((i) => (
          <Card key={i} style={styles.upcomingCard}>
            <View style={styles.upcomingIcon}>
              <Clock size={20} color={Colors.secondary} />
            </View>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingTitle}>Pharmacology Seminar</Text>
              <Text style={styles.upcomingDate}>Tomorrow, 10:00 AM</Text>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  section: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  activeCard: { backgroundColor: Colors.text, padding: 24, marginBottom: 16 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.danger, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.white },
  liveText: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  activeTitle: { color: Colors.white, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  activeSub: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24 },
  btnRow: { flexDirection: 'row', gap: 12 },
  joinBtn: { flex: 1 },
  attendanceBtn: { width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { alignItems: 'center', padding: 40, borderStyle: 'dashed' },
  emptyText: { color: Colors.textSecondary, fontSize: 14, marginTop: 16 },
  upcomingCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12 },
  upcomingIcon: { width: 44, height: 44, backgroundColor: Colors.surface, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  upcomingInfo: { flex: 1, marginLeft: 16 },
  upcomingTitle: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  upcomingDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
