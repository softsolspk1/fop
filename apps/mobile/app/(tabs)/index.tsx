import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BookOpen, Video, Users, FlaskConical, Bell, Calendar, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Colors, Card } from '../../components/UI';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      if (user.role === 'STUDENT') {
        const { data } = await api.get('/reports/dashboard-stats/stats');
        setStats({
          attendance: data.attendance || 0,
          courses: data.courses || 0,
          labs: data.labs || 0,
          exams: data.exams || 0
        });
      } else {
        const { data } = await api.get('/departments/my-stats');
        setStats({
          faculty: data?.facultyCount || '0',
          students: data?.studentCount || '0',
          courses: data?.courseCount || '0',
        });
      }
    } catch (error) {
      console.error('[Dashboard Stats Error]:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const QuickAction = ({ icon: Icon, label, onPress, color }: any) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.avatar}>
            <Image source={require('../../assets/logo.png')} style={styles.avatarImg} />
          </TouchableOpacity>
        </View>

        <Card style={styles.roleCard}>
          <View style={styles.roleInfo}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role?.replace('_', ' ')}</Text>
            </View>
            <Text style={styles.deptText}>Faculty of Pharmacy</Text>
          </View>
          <Bell size={24} color={Colors.white} />
        </Card>
      </View>

      <View style={styles.content}>
        {user?.role === 'STUDENT' && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <QuickAction icon={Calendar} label="Timetable" color="#2563eb" onPress={() => router.push('/timetable')} />
              <QuickAction icon={FileText} label="Exams" color="#7c3aed" onPress={() => router.push('/exams')} />
              <QuickAction icon={CreditCard} label="Fees" color="#059669" onPress={() => router.push('/fees')} />
              <QuickAction icon={FlaskConical} label="Virtual Lab" color="#ea580c" onPress={() => router.push('/(tabs)/labs')} />
              <QuickAction icon={Users} label="Faculty" color="#db2777" onPress={() => router.push('/faculty-directory')} />
              <QuickAction icon={Award} label="Assessments" color="#d97706" onPress={() => router.push('/lab-assessment')} />
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Quick Overview</Text>
        <View style={styles.statsGrid}>
          <StatCircle icon={BookOpen} label="Courses" value={stats?.courses} color="#2563eb" />
          <StatCircle icon={Users} label="Students" value={stats?.students || stats?.attendance} color="#16a34a" />
          <StatCircle icon={Video} label="Live" value="0" color="#ef4444" />
          <StatCircle icon={FlaskConical} label="Labs" value={stats?.labs || '---'} color="#ea580c" />
        </View>

        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <Card style={styles.sessionCard}>
            <Calendar size={20} color={Colors.primary} />
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionName}>Pharmacology Lab</Text>
              <Text style={styles.sessionTime}>Today, 10:00 AM • Room 102</Text>
            </View>
            <ChevronRight size={20} color={Colors.secondary} />
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

import { CreditCard, Award } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  welcome: { fontSize: 16, color: Colors.textSecondary },
  name: { fontSize: 32, fontWeight: 'bold', color: Colors.text },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: Colors.primary, padding: 2 },
  avatarImg: { width: '100%', height: '100%', borderRadius: 28 },
  roleCard: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  roleInfo: { gap: 4 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  roleText: { color: Colors.white, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  deptText: { color: Colors.white, fontSize: 14, opacity: 0.8 },
  content: { padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statCard: { width: '47%', alignItems: 'center', padding: 24 },
  statIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  upcomingSection: { marginTop: 32 },
  actionsSection: { marginBottom: 32 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  actionBtn: { width: '31%', backgroundColor: Colors.white, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { color: Colors.primary, fontWeight: 'bold' },
  sessionCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  sessionTime: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
});
