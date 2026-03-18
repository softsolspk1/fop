import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react-native';
import api from '../lib/api';

export default function TimeTableScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data } = await api.get('/classes');
      setSchedule(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [activeDay, setActiveDay] = useState('Monday');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Time Table</Text>
      </View>

      <View style={styles.daySelector}>
        {days.map(day => (
          <TouchableOpacity 
            key={day} 
            style={[styles.dayChip, activeDay === day && styles.activeDayChip]}
            onPress={() => setActiveDay(day)}
          >
            <Text style={[styles.dayText, activeDay === day && styles.activeDayText]}>{day.substring(0, 3)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={schedule.filter(item => item.dayOfWeek === activeDay)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.timeTag}>
                <Clock size={14} color="#2563eb" />
                <Text style={styles.timeText}>
                  {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.courseTitle}>{item.title}</Text>
              <Text style={styles.faculty}>{item.course?.teacher?.name || 'Faculty Member'}</Text>
              <View style={styles.footer}>
                <View style={styles.info}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={styles.infoText}>{item.location}</Text>
                </View>
              </View>
            </View>
          )}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.empty}>
              <CalendarIcon size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No classes scheduled for {activeDay}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
  backBtn: { marginRight: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  daySelector: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', gap: 10 },
  dayChip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  activeDayChip: { backgroundColor: '#2563eb' },
  dayText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  activeDayText: { color: '#fff' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  timeText: { fontSize: 12, fontWeight: 'bold', color: '#2563eb' },
  courseTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  faculty: { fontSize: 13, color: '#64748b', marginTop: 4 },
  footer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  info: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, color: '#64748b' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16 },
});
