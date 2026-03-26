import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Users, Calendar, CheckCircle2 } from 'lucide-react-native';
import api from '../lib/api';

export default function AttendanceLogsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    try {
      // For now we fetch all classes and the UI/API usually filters by teacher on backend 
      // or we handle it here if the endpoint returns everything.
      const { data } = await api.get('/classes');
      setClasses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderClassItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: '/class-attendance-detail',
        params: { id: item.id, title: item.title }
      })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Calendar size={20} color="#2563eb" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.classTitle}>{item.title}</Text>
          <Text style={styles.courseName}>{item.course?.name || 'Pharmacy Course'}</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>DATE</Text>
          <Text style={styles.statValue}>{new Date(item.startTime).toLocaleDateString()}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>MARK</Text>
          <View style={styles.statusBadge}>
            <CheckCircle2 size={12} color="#16a34a" />
            <Text style={styles.statusText}>Completed</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Logs</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={classes}
          renderItem={renderClassItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyClasses(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Users size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No class logs found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  titleContainer: { flex: 1 },
  classTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  courseName: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  stat: { flex: 1 },
  statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 14, color: '#16a34a', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16 },
});
