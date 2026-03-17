import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FileText, ChevronRight, Award, Calendar } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function ResultsScreen() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/results/student/${user.id}`);
      setResults(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Academic Results</Text>
        <Text style={styles.subtitle}>Session: 2024-2025</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>3.85</Text>
          <Text style={styles.summaryLabel}>CGPA</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{results.length}</Text>
          <Text style={styles.summaryLabel}>Courses</Text>
        </View>
      </View>

      <View style={styles.list}>
        {results.map((res, idx) => (
          <TouchableOpacity key={res.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <FileText size={20} color="#2563eb" />
              </View>
              <View style={styles.info}>
                <Text style={styles.courseName}>{res.course.name}</Text>
                <Text style={styles.courseCode}>{res.course.code}</Text>
              </View>
              <View style={styles.gradeBox}>
                 <Text style={[styles.gradeText, res.grade === 'F' && { color: '#ef4444' }]}>{res.grade}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
               <View style={styles.footerItem}>
                  <Award size={14} color="#64748b" />
                  <Text style={styles.footerText}>{res.marks} / 100</Text>
               </View>
               <View style={styles.footerItem}>
                  <Calendar size={14} color="#64748b" />
                  <Text style={styles.footerText}>Sem {res.semester}</Text>
               </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, marginTop: 40 },
  title: { fontSize: 28, fontWeight: '900', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', fontWeight: '600', marginTop: 4 },
  summaryCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#2563eb',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '900', color: '#fff' },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  list: { padding: 24, paddingTop: 0 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, backgroundColor: '#eff6ff', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  courseName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  courseCode: { fontSize: 12, color: '#2563eb', fontWeight: '800', marginTop: 2 },
  gradeBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 20, fontWeight: '900', color: '#10b981' },
  cardFooter: { flexDirection: 'row', marginTop: 16, pt: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 20 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
});
