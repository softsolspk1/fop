import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, GraduationCap, Calendar, Award, MapPin } from 'lucide-react-native';
import api from '../lib/api';

export default function ExamsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'results'>('schedule');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, resultsRes] = await Promise.all([
        api.get('/exams/schedule'),
        api.get('/exams/my-results')
      ]);
      setExams(examsRes.data);
      setResults(resultsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderExamItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Calendar size={20} color="#2563eb" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.examTitle}>{item.title}</Text>
          <Text style={styles.courseName}>{item.course?.name || 'Pharmacy Course'}</Text>
        </View>
      </View>
      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Clock size={14} color="#64748b" />
          <Text style={styles.detailText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detail}>
          <MapPin size={14} color="#64748b" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
      </View>
    </View>
  );

  const renderResultItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
          <Award size={20} color="#16a34a" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.examTitle}>{item.exam?.title}</Text>
          <Text style={styles.courseName}>{item.exam?.course?.name}</Text>
        </View>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeText}>{item.grade}</Text>
        </View>
      </View>
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Score obtained:</Text>
        <Text style={styles.scoreValue}>{item.score}/100</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Examinations</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]} 
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'results' && styles.activeTab]} 
          onPress={() => setActiveTab('results')}
        >
          <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>Results</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'schedule' ? exams : results}
          renderItem={activeTab === 'schedule' ? renderExamItem : renderResultItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <GraduationCap size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No {activeTab} available</Text>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: '#eff6ff' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#2563eb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  titleContainer: { flex: 1 },
  examTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  courseName: { fontSize: 12, color: '#64748b', marginTop: 2 },
  detailsRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: '#64748b' },
  gradeBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  gradeText: { fontSize: 14, fontWeight: 'bold', color: '#16a34a' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  scoreLabel: { fontSize: 12, color: '#64748b' },
  scoreValue: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16 },
});
 Jonah
