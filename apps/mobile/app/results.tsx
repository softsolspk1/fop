import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { FileText, ChevronRight, Award, Calendar, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Card } from '../components/UI';

export default function ResultsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResults = async () => {
    try {
      if (!user?.id) return;
      const res = await api.get(`/results/student/${user.id}`);
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('[Results Error]:', error);
      setResults([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchResults();
  };

  const gpa = results.length > 0 ? (results.reduce((acc, curr) => acc + (curr.gpa || 3.0), 0) / results.length).toFixed(2) : '---';

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Academic Performance</Text>
        <Text style={styles.subtitle}>Session: 2024-2025</Text>
      </View>

      <Card style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{gpa}</Text>
          <Text style={styles.summaryLabel}>CGPA</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{results.length}</Text>
          <Text style={styles.summaryLabel}>Courses</Text>
        </View>
      </Card>

      <View style={styles.list}>
        {loading ? (
           <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : results.length > 0 ? (
          results.map((res: any) => (
            <Card key={res.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: Colors.primary + '10' }]}>
                  <FileText size={20} color={Colors.primary} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.courseName}>{res.course?.name || 'Course Name'}</Text>
                  <Text style={styles.courseCode}>{res.course?.code || 'CODE'}</Text>
                </View>
                <View style={styles.gradeBox}>
                   <Text style={[styles.gradeText, res.grade === 'F' && { color: Colors.danger }]}>{res.grade}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                 <View style={styles.footerItem}>
                    <Award size={14} color={Colors.textSecondary} />
                    <Text style={styles.footerText}>{res.marks} / 100</Text>
                 </View>
                 <View style={styles.footerItem}>
                    <Calendar size={14} color={Colors.textSecondary} />
                    <Text style={styles.footerText}>Sem {res.semester}</Text>
                 </View>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.empty}>
             <Award size={64} color={Colors.border} />
             <Text style={styles.emptyText}>No results published yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  summaryCard: {
    margin: 24,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 24,
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 28, fontWeight: 'bold', color: Colors.white },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  list: { padding: 24, paddingTop: 0, gap: 16, paddingBottom: 100 },
  card: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  courseName: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  courseCode: { fontSize: 12, color: Colors.primary, fontWeight: '800', marginTop: 2 },
  gradeBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 20, fontWeight: 'bold', color: Colors.success },
  cardFooter: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 20 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, marginTop: 16 },
});
