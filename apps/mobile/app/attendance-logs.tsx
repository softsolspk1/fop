import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Users, Calendar, CheckCircle2, MoreVertical, Clock, ChevronRight } from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card } from '../components/UI';

export default function AttendanceLogsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyClasses = useCallback(async () => {
    try {
      const { data } = await api.get('/classes');
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyClasses();
  };

  const renderClassItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <TouchableOpacity 
        style={styles.cardInner}
        onPress={() => router.push({
          pathname: '/class-attendance-detail',
          params: { id: item.id, title: item.title }
        })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Calendar size={22} color={Colors.primary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.classTitle}>{item.title}</Text>
            <Text style={styles.courseName}>{item.course?.name || 'Pharmacy Course'}</Text>
          </View>
          <ChevronRight size={18} color={Colors.border} />
        </View>
        
        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <View style={styles.statIcon}>
               <Clock size={12} color={Colors.textSecondary} />
               <Text style={styles.statLabel}>DATE</Text>
            </View>
            <Text style={styles.statValue}>{new Date(item.startTime).toLocaleDateString()}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { textAlign: 'right', marginBottom: 6 }]}>STATUS</Text>
            <View style={styles.statusBadge}>
              <CheckCircle2 size={12} color="#10b981" />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
           <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
             <ChevronLeft size={24} color={Colors.text} />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Attendance Logs</Text>
           <TouchableOpacity style={styles.moreBtn}>
              <MoreVertical size={24} color={Colors.text} />
           </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Session History & Records</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={classes}
          renderItem={renderClassItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Users size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No attendance records found</Text>
              <Text style={styles.emptySub}>Logs will appear here after sessions end.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  subtitle: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  moreBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 24, paddingBottom: 100 },
  card: { marginBottom: 16, padding: 0, overflow: 'hidden' },
  cardInner: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  titleContainer: { flex: 1 },
  classTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  courseName: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.slate50, marginVertical: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stat: { },
  statIcon: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '900', letterSpacing: 1 },
  statValue: { fontSize: 14, fontWeight: '800', color: Colors.text },
  statusBadge: { backgroundColor: '#f0fdf4', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, color: '#10b981', fontWeight: '900', textTransform: 'uppercase' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.text, fontSize: 18, fontWeight: '900', marginTop: 24 },
  emptySub: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 8, textAlign: 'center' },
});
