import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, FileText, Download, CheckCircle2, Clock } from 'lucide-react-native';
import api from '../lib/api';

export default function AssignmentsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get('/assignments');
      setAssignments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Assignments</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={assignments}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.courseBadge}>
                <Text style={styles.courseText}>{item.course?.name || 'General'}</Text>
              </View>
              <Text style={styles.assTitle}>{item.title}</Text>
              <Text style={styles.assDesc} numberOfLines={2}>{item.description}</Text>
              
              <View style={styles.deadlineRow}>
                <Clock size={14} color="#ef4444" />
                <Text style={styles.deadlineText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Download', 'File download started...')}>
                  <Download size={18} color="#2563eb" />
                  <Text style={styles.actionBtnText}>Download task</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.submitBtn]} onPress={() => Alert.alert('Submit', 'Submission portal opening...')}>
                  <CheckCircle2 size={18} color="#fff" />
                  <Text style={[styles.actionBtnText, { color: '#fff' }]}>Submit Work</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.empty}>
              <FileText size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No pending assignments</Text>
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  courseBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  courseText: { fontSize: 10, fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' },
  assTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  assDesc: { fontSize: 14, color: '#64748b', marginTop: 8 },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  deadlineText: { fontSize: 12, color: '#ef4444', fontWeight: 'bold' },
  footer: { flexDirection: 'row', gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#eff6ff' },
  submitBtn: { backgroundColor: '#2563eb' },
  actionBtnText: { fontSize: 14, fontWeight: 'bold', color: '#2563eb' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16 },
});
