import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { BarChart2, TrendingUp, Users, BookOpen } from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card } from '../components/UI';

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/reports/dashboard-stats/stats');
      setStats(data);
    } catch (error) {
      console.error('[Reports Error]:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const ReportRow = ({ label, value, icon: Icon, color }: any) => (
    <Card style={styles.statCard}>
       <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
          <Icon size={20} color={color} />
       </View>
       <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
       </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Academic Analytics</Text>
        <Text style={styles.subtitle}>Performance and enrollment overview</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}
      >
        <View style={styles.grid}>
           <ReportRow label="Total Students" value={stats?.students || '0'} icon={Users} color="#2563eb" />
           <ReportRow label="Active Faculty" value={stats?.faculty || '0'} icon={TrendingUp} color="#7c3aed" />
           <ReportRow label="Course Coverage" value={stats?.courses || '0'} icon={BookOpen} color="#059669" />
           <ReportRow label="Avg Attendance" value={(stats?.attendance || '85') + '%'} icon={BarChart2} color="#ea580c" />
        </View>

        <Card style={styles.mainCharCard}>
           <Text style={styles.cardTitle}>Sessional Progress</Text>
           <View style={styles.placeholderChart}>
              <Text style={styles.placeholderText}>Detailed charts available in Web Portal</Text>
           </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomWidth: 1, borderColor: Colors.border },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginTop: 4 },
  scroll: { padding: 24, paddingBottom: 100 },
  grid: { gap: 16 },
  statCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase' },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.text, marginTop: 4 },
  mainCharCard: { marginTop: 24, padding: 24, borderRadius: 32 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: Colors.text, marginBottom: 20 },
  placeholderChart: { height: 200, backgroundColor: Colors.slate50, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: Colors.border },
  placeholderText: { color: Colors.textSecondary, fontWeight: '700', fontSize: 13 }
});
