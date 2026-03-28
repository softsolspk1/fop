import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, User, CheckCircle2, XCircle, Calendar, Users, MoreVertical } from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card } from '../components/UI';

export default function ClassAttendanceDetailScreen() {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<any[]>([]);

  const fetchAttendance = useCallback(async () => {
    try {
      const { data } = await api.get(`/attendance/class/${id}`);
      setRecords(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const renderStudentItem = ({ item }: { item: any }) => (
    <Card style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <View style={styles.avatar}>
           <Text style={styles.avatarText}>{item.user?.name?.[0]}</Text>
        </View>
        <View>
          <Text style={styles.studentName}>{item.user?.name}</Text>
          <Text style={styles.rollNumber}>{item.user?.rollNumber || 'No RO-ID'}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'PRESENT' ? '#f0fdf4' : '#fef2f2' }]}>
        <View style={[styles.statusDot, { backgroundColor: item.status === 'PRESENT' ? '#22c55e' : '#ef4444' }]} />
        <Text style={[styles.statusText, { color: item.status === 'PRESENT' ? '#16a34a' : '#dc2626' }]}>
           {item.status}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
           <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
             <ChevronLeft size={24} color={Colors.text} />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Academic Attendance</Text>
           <TouchableOpacity style={styles.moreBtn}>
             <MoreVertical size={24} color={Colors.text} />
           </TouchableOpacity>
        </View>
        
        <View style={styles.sessionInfo}>
           <View style={styles.infoIconBox}>
              <Calendar size={28} color={Colors.primary} />
           </View>
           <View style={{ flex: 1 }}>
              <Text style={styles.sessionTitle} numberOfLines={1}>{title || 'Lecture Session'}</Text>
              <View style={styles.metaRow}>
                 <Users size={12} color={Colors.textSecondary} />
                 <Text style={styles.metaText}>{records.length} Students Enrolled</Text>
              </View>
           </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderStudentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <User size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No attendance records found</Text>
              <Text style={styles.emptySub}>Ask students to mark themselves or manual entry.</Text>
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
  moreBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  sessionInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  infoIconBox: { width: 64, height: 64, backgroundColor: Colors.primaryLight, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sessionTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 24, paddingBottom: 100 },
  studentCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 12 },
  studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.slate50, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  studentName: { fontSize: 15, fontWeight: '800', color: Colors.text },
  rollNumber: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.text, fontSize: 18, fontWeight: '900', marginTop: 24 },
  emptySub: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 8, textAlign: 'center' },
});
