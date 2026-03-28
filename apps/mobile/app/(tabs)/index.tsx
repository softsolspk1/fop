import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BookOpen, Video, Users, FlaskConical, Bell, Calendar, ChevronRight, Award, CreditCard, FileText, Megaphone } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Colors, Card, Button } from '../../components/UI';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [statsRes, annRes] = await Promise.all([
        user.role === 'STUDENT' 
          ? api.get('/reports/dashboard-stats/stats') 
          : api.get('/departments/my-stats'),
        api.get('/announcements')
      ]);

      if (user.role === 'STUDENT') {
        const data = statsRes.data;
        setStats({
          attendance: data.attendance || 0,
          courses: data.courses || 0,
          labs: data.labs || 0,
          exams: data.exams || 0,
          assignments: data.assignments || 0,
          upcomingQuizzes: data.upcomingQuizzes || 0,
          gpa: data.gpa || '0.0'
        });
      } else {
        const data = statsRes.data;
        setStats({
          faculty: data?.facultyCount || '0',
          students: data?.studentCount || '0',
          courses: data?.courseCount || '0',
        });
      }
      setRecentAnnouncements(annRes.data.slice(0, 3));
    } catch (error) {
      console.error('[Dashboard Data Error]:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const QuickAction = ({ icon: Icon, label, onPress, color }: any) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '10' }]}>
        <Icon size={22} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcome}>Good Morning,</Text>
            <Text style={styles.name}>{user?.name?.split(' ')[0] || 'Scholar'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/(tabs)/announcements')}>
             <Bell size={24} color={Colors.text} />
             {recentAnnouncements.length > 0 && <View style={styles.notifBadge} />}
          </TouchableOpacity>
        </View>

        <View style={styles.roleCard}>
           <View style={styles.roleInfo}>
              <View style={styles.roleTag}>
                 <Text style={styles.roleTagText}>{user?.role?.replace('_', ' ')}</Text>
              </View>
              <Text style={styles.deptName}>Faculty of Pharmacy</Text>
           </View>
           <Image source={require('../../assets/logo.png')} style={styles.headerLogo} />
        </View>
      </View>

      <View style={styles.content}>
        {/* GPA / Stats Overview */}
        <View style={styles.statsSection}>
           <Card style={styles.gpaCard}>
              <View>
                 <Text style={styles.gpaLabel}>Current GPA</Text>
                 <Text style={styles.gpaValue}>{stats?.gpa || '0.00'}</Text>
              </View>
              <View style={styles.gpaCircle}>
                 <Award size={32} color={Colors.white} />
              </View>
           </Card>
           <View style={styles.miniStats}>
              <Card style={styles.miniStatCard}>
                 <Text style={styles.miniStatVal}>{stats?.courses || 0}</Text>
                 <Text style={styles.miniStatLabel}>Courses</Text>
              </Card>
              <Card style={styles.miniStatCard}>
                 <Text style={styles.miniStatVal}>{stats?.attendance || 0}%</Text>
                 <Text style={styles.miniStatLabel}>Attendance</Text>
              </Card>
           </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <QuickAction icon={Calendar} label="Timetable" color="#2563eb" onPress={() => router.push('/timetable')} />
            <QuickAction icon={Video} label="Live Class" color="#7c3aed" onPress={() => router.push('/(tabs)/courses')} />
            <QuickAction icon={CreditCard} label="Fee Slip" color="#059669" onPress={() => router.push('/fees')} />
            <QuickAction icon={FileText} label="Exams" color="#ea580c" onPress={() => router.push('/exams')} />
          </View>
        </View>

        {/* Recent Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bulletins</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/announcements')}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentAnnouncements.map((ann, idx) => (
            <TouchableOpacity key={ann.id} onPress={() => router.push('/(tabs)/announcements')}>
               <Card style={[styles.annPreview, idx === 0 && styles.firstAnn]}>
                  <View style={styles.annIconBox}>
                     <Megaphone size={18} color={idx === 0 ? Colors.primary : Colors.secondary} />
                  </View>
                  <View style={styles.annText}>
                     <Text style={styles.annTitle} numberOfLines={1}>{ann.title}</Text>
                     <Text style={styles.annDate}>{new Date(ann.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <ChevronRight size={16} color={Colors.border} />
               </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  welcome: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
  name: { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  notificationBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notifBadge: { width: 8, height: 8, backgroundColor: Colors.danger, borderRadius: 4, position: 'absolute', top: 12, right: 12, borderWidth: 2, borderColor: Colors.surface },
  roleCard: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderRadius: 24, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  roleInfo: { gap: 4 },
  roleTag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  roleTagText: { color: Colors.white, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  deptName: { color: Colors.white, fontSize: 14, fontWeight: '600', opacity: 0.9 },
  headerLogo: { width: 40, height: 40, opacity: 0.2, tintColor: Colors.white },
  content: { padding: 24 },
  statsSection: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  gpaCard: { flex: 1.2, backgroundColor: Colors.indigo, padding: 20, borderRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gpaLabel: { color: Colors.white, fontSize: 12, fontWeight: '700', opacity: 0.8 },
  gpaValue: { color: Colors.white, fontSize: 28, fontWeight: '900' },
  gpaCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  miniStats: { flex: 1, gap: 12 },
  miniStatCard: { flex: 1, padding: 12, alignItems: 'center', justifyContent: 'center' },
  miniStatVal: { fontSize: 18, fontWeight: '900', color: Colors.text },
  miniStatLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 16, letterSpacing: -0.5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { color: Colors.primary, fontWeight: '800', fontSize: 13 },
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, backgroundColor: Colors.surface, borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 11, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  annPreview: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, marginBottom: 8 },
  firstAnn: { borderColor: Colors.primary + '30', backgroundColor: Colors.primary + '05' },
  annIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.slate50, justifyContent: 'center', alignItems: 'center' },
  annText: { flex: 1 },
  annTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  annDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
});
