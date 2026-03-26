import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, User, CheckCircle2, XCircle } from 'lucide-react-native';
import api from '../lib/api';

export default function ClassAttendanceDetailScreen() {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchAttendance();
  }, [id]);

  const fetchAttendance = async () => {
    try {
      const { data } = await api.get(`/attendance/class/${id}`);
      setRecords(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStudentItem = ({ item }: { item: any }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <View style={styles.avatar}>
          <User size={20} color="#64748b" />
        </View>
        <View>
          <Text style={styles.studentName}>{item.user?.name}</Text>
          <Text style={styles.rollNumber}>{item.user?.rollNumber || 'N/A'}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'PRESENT' ? '#f0fdf4' : '#fef2f2' }]}>
        {item.status === 'PRESENT' ? (
          <CheckCircle2 size={16} color="#16a34a" />
        ) : (
          <XCircle size={16} color="#dc2626" />
        )}
        <Text style={[styles.statusText, { color: item.status === 'PRESENT' ? '#16a34a' : '#dc2626' }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Attendance Detail</Text>
          <Text style={styles.headerSubtitle}>{title}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderStudentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <User size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No attendance records for this class</Text>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  headerSubtitle: { fontSize: 12, color: '#64748b' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  studentCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f1f5f9' },
  studentInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  studentName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  rollNumber: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16 },
});
