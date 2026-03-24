import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { FileText, Award, Calendar, ChevronRight, Search } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function ResultsScreen() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data } = await api.get('/results/me');
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setResults([]);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Academic Results</Text>
        <Text style={styles.subtitle}>Examination & Assessment Records</Text>
      </View>

      <FlatList
        data={results}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchResults(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.iconContainer}>
              <Award size={24} color="#2563eb" />
            </View>
            <View style={styles.content}>
               <Text style={styles.courseCode}>{item.course?.code || 'COURSE'}</Text>
               <Text style={styles.courseName}>{item.course?.name || 'Loading...'}</Text>
               <View style={styles.metaRow}>
                 <Calendar size={14} color="#64748b" />
                 <Text style={styles.metaText}>Semester {item.semester || '-'}</Text>
                 <Text style={styles.metaText}>• {item.academicYear || ''}</Text>
               </View>
            </View>
            <View style={styles.gradeContainer}>
               <Text style={styles.gradeText}>{item.grade || '-'}</Text>
               <Text style={styles.gpaText}>{item.marks || '0'} Marks</Text>
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
                <FileText size={48} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No Results Yet</Text>
            <Text style={styles.emptySubtitle}>Your examination results will appear here once published by the department.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  list: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconContainer: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 16 },
  courseCode: { fontSize: 10, fontWeight: '900', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1 },
  courseName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  metaText: { fontSize: 12, color: '#64748b' },
  gradeContainer: { alignItems: 'center', marginRight: 12, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  gradeText: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
  gpaText: { fontSize: 10, color: '#64748b', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
