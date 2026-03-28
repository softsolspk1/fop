import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, GraduationCap, Calendar, Award, MapPin, Clock, MoreVertical, FileText } from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card } from '../components/UI';

export default function ExamsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'schedule' | 'results'>('schedule');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [examsRes, resultsRes] = await Promise.all([
        api.get('/exams/schedule'),
        api.get('/exams/my-results')
      ]);
      setExams(Array.isArray(examsRes.data) ? examsRes.data : []);
      setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderExamItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Calendar size={22} color={Colors.primary} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.examTitle}>{item.title}</Text>
          <Text style={styles.courseName}>{item.course?.name || 'Academic Course'}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detail}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.location || 'Examination Hall'}</Text>
        </View>
      </View>
    </Card>
  );

  const renderResultItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
          <Award size={22} color="#16a34a" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.examTitle}>{item.exam?.title}</Text>
          <Text style={styles.courseName}>{item.exam?.course?.name}</Text>
        </View>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeText}>{item.grade || 'P'}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Performance Score:</Text>
        <Text style={styles.scoreValue}>{item.score || 0}/100</Text>
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
           <Text style={styles.headerTitle}>Examinations</Text>
           <TouchableOpacity style={styles.moreBtn}>
              <MoreVertical size={24} color={Colors.text} />
           </TouchableOpacity>
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
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'schedule' ? exams : results}
          renderItem={activeTab === 'schedule' ? renderExamItem : renderResultItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <FileText size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No {activeTab} available</Text>
              <Text style={styles.emptySub}>Examination data is synced periodically.</Text>
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
  tabBar: { flexDirection: 'row', backgroundColor: Colors.slate50, padding: 4, borderRadius: 20, gap: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
  activeTab: { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '800', color: Colors.textSecondary },
  activeTabText: { color: Colors.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 24, paddingBottom: 100 },
  card: { padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  titleContainer: { flex: 1 },
  examTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  courseName: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.slate50, marginBottom: 16 },
  detailsRow: { flexDirection: 'row', gap: 20 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700' },
  gradeBadge: { width: 36, height: 36, backgroundColor: '#f0fdf4', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 16, fontWeight: '900', color: '#16a34a' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  scoreValue: { fontSize: 14, fontWeight: '900', color: Colors.text },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.text, fontSize: 18, fontWeight: '900', marginTop: 24 },
  emptySub: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 8, textAlign: 'center' },
});
