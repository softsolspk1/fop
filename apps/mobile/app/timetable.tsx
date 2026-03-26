import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card } from '../components/UI';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimeTableScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState('Monday');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedule = async () => {
    try {
      const { data } = await api.get('/classes');
      setSchedule(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[Timetable Error]:', error);
      setSchedule([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedule();
  };

  const filteredData = schedule.filter(item => item.dayOfWeek === activeDay);

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.timeSection}>
        <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
        <Text style={styles.timeText}>
          {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.timeDivider}>-</Text>
        <Text style={styles.timeText}>
          {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      <Text style={styles.courseTitle}>{item.title}</Text>
      <Text style={styles.facultyName}>{item.course?.teacher?.name || 'Faculty Member'}</Text>
      
      <View style={styles.locationRow}>
        <MapPin size={14} color={Colors.textSecondary} />
        <Text style={styles.locationText}>{item.location || 'Lecture Hall'}</Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Weekly Schedule</Text>
          <Text style={styles.subtitle}>Academic Timetable</Text>
        </View>
      </View>

      <View style={styles.dayBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
          {DAYS.map(day => (
            <TouchableOpacity 
              key={day} 
              style={[styles.dayChip, activeDay === day && styles.activeDayChip]}
              onPress={() => setActiveDay(day)}
            >
              <Text style={[styles.dayText, activeDay === day && styles.activeDayText]}>{day}</Text>
              {activeDay === day && <View style={styles.activeDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          loading ? (
             <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.empty}>
              <CalendarIcon size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No classes scheduled for {activeDay}</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: Colors.surface, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary },
  dayBar: { paddingVertical: 16, backgroundColor: Colors.white },
  dayScroll: { paddingHorizontal: 24, gap: 12 },
  dayChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', minWidth: 100 },
  activeDayChip: { backgroundColor: Colors.primary + '15' },
  dayText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  activeDayText: { color: Colors.primary },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 4 },
  list: { padding: 24, gap: 16, paddingBottom: 100 },
  card: { padding: 20 },
  timeSection: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  timeText: { fontSize: 13, fontWeight: 'bold', color: Colors.text },
  timeDivider: { color: Colors.border },
  courseTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  facultyName: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  locationText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, marginTop: 16 },
});
