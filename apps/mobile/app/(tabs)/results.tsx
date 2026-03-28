import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { FileText, ChevronRight, Award, Calendar, TrendingUp, MoreVertical } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Colors, Card } from '../../components/UI';

export default function ResultsScreen() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/results/student/${user?.id || user?.userId}`);
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchResults();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
           <Text style={styles.title}>Academic Results</Text>
           <TouchableOpacity style={styles.moreBtn}>
              <MoreVertical size={24} color={Colors.text} />
           </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Full Transcript & Grade History</Text>
      </View>

      <View style={styles.summarySection}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>3.85</Text>
            <Text style={styles.summaryLabel}>CGPA</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.summaryItem}>
             <View style={styles.rankIcon}>
                <TrendingUp size={14} color={Colors.white} />
             </View>
            <Text style={styles.summaryValue}>1st</Text>
            <Text style={styles.summaryLabel}>Rank</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{results.length}</Text>
            <Text style={styles.summaryLabel}>Courses</Text>
          </View>
        </Card>
      </View>

      <View style={styles.list}>
        <Text style={styles.sectionTitle}>Sessional Performance</Text>
        {results.length === 0 ? (
          <View style={styles.empty}>
             <Award size={64} color={Colors.border} />
             <Text style={styles.emptyText}>No records found</Text>
          </View>
        ) : (
          results.map((res, idx) => (
            <Card key={res.id || idx} style={styles.itemCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <FileText size={22} color={Colors.primary} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.courseName}>{res.course?.name || 'Academic Course'}</Text>
                  <Text style={styles.courseCode}>{res.course?.code || 'PHR-00'}</Text>
                </View>
                <View style={styles.gradeBox}>
                   <Text style={[styles.gradeText, res.grade === 'F' && { color: Colors.danger }]}>{res.grade || 'P'}</Text>
                </View>
              </View>
              <View style={styles.hDivider} />
              <View style={styles.cardFooter}>
                 <View style={styles.footerItem}>
                    <Award size={14} color={Colors.textSecondary} />
                    <Text style={styles.footerText}>{res.marks || 0} / 100</Text>
                 </View>
                 <View style={styles.footerItem}>
                    <Calendar size={14} color={Colors.textSecondary} />
                    <Text style={styles.footerText}>Sem {res.semester || 'I'}</Text>
                 </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  moreBtn: { width: 44, height: 44, backgroundColor: Colors.slate50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  summarySection: { padding: 24, marginTop: -40 },
  summaryCard: {
    backgroundColor: Colors.primary,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '900', color: Colors.white },
  summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '900', marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 },
  vDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  rankIcon: { position: 'absolute', top: -30, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 24, paddingTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: Colors.text, marginBottom: 20, letterSpacing: -0.5 },
  itemCard: { padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 52, height: 52, backgroundColor: Colors.primaryLight, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  courseName: { fontSize: 16, fontWeight: '800', color: Colors.text },
  courseCode: { fontSize: 12, color: Colors.primary, fontWeight: '900', marginTop: 2, textTransform: 'uppercase' },
  gradeBox: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 24, fontWeight: '900', color: '#10b981' },
  hDivider: { height: 1, backgroundColor: Colors.slate50, marginVertical: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary },
  empty: { alignItems: 'center', marginTop: 60, padding: 40 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '700', marginTop: 16 },
});
