import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Calendar, Clock, BookOpen, GraduationCap, Users, FileText, Bell, FlaskConical, Video, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [user?.role]);

  const fetchStats = async () => {
    try {
      if (!user) return; // Guard against null user during startup

      if (user.role === 'HOD' || user.role === 'DEPT_ADMIN') {
        const { data } = await api.get('/departments/my-stats');
        setStats({
          facultyCount: data.facultyCount.toString(),
          deptStudents: data.studentCount.toString(),
          courses: data.courseCount.toString()
        });
      } else if (user.role === 'FACULTY' || user.role === 'TEACHER') {
        // Fetch teacher classes to count active ones
        const { data } = await api.get('/classes');
        setStats({
          activeCourses: data.length.toString(), // Simplified for now
          myStudents: '120' // This would ideally come from another endpoint
        });
      } else {
        // Mocked student stats for now (placeholder for future student APIs)
        setStats({
          attendance: '92%',
          gpa: '3.8',
          labs: '4/5'
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderStudentStats = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
          <GraduationCap size={20} color="#2563eb" />
        </View>
        <Text style={styles.statLabel}>Current GPA</Text>
        <Text style={styles.statValue}>{stats.gpa}</Text>
      </View>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#f0fdf4' }]}>
          <Users size={20} color="#16a34a" />
        </View>
        <Text style={styles.statLabel}>Attendance</Text>
        <Text style={styles.statValue}>{stats.attendance}</Text>
      </View>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#fff7ed' }]}>
          <FlaskConical size={20} color="#ea580c" />
        </View>
        <Text style={styles.statLabel}>Labs Done</Text>
        <Text style={styles.statValue}>{stats.labs}</Text>
      </View>
    </View>
  );

  const renderFacultyStats = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
          <BookOpen size={20} color="#2563eb" />
        </View>
        <Text style={styles.statLabel}>Active Courses</Text>
        <Text style={styles.statValue}>4</Text>
      </View>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#f0fdf4' }]}>
          <Users size={20} color="#16a34a" />
        </View>
        <Text style={styles.statLabel}>My Students</Text>
        <Text style={styles.statValue}>180</Text>
      </View>
    </View>
  );

  const renderHODStats = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
          <Users size={20} color="#2563eb" />
        </View>
        <Text style={styles.statLabel}>Faculty</Text>
        <Text style={styles.statValue}>{stats.facultyCount}</Text>
      </View>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#f0fdf4' }]}>
          <Users size={20} color="#16a34a" />
        </View>
        <Text style={styles.statLabel}>Students</Text>
        <Text style={styles.statValue}>{stats.deptStudents}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.logoCircle}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.headerLogo}
            />
          </View>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <View style={styles.roleBadge}>
               <Text style={styles.roleText}>{user?.role?.replace('_', ' ')}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {user?.role === 'STUDENT' && renderStudentStats()}
        {user?.role === 'FACULTY' && renderFacultyStats()}
        {(user?.role === 'HOD' || user?.role === 'DEPT_ADMIN') && renderHODStats()}

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {user?.role === 'STUDENT' && (
            <>
              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/timetable')}>
                <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
                  <Calendar size={24} color="#2563eb" />
                </View>
                <Text style={styles.actionLabel}>Time Table</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/assignments')}>
                <View style={[styles.actionIcon, { backgroundColor: '#fdf2f8' }]}>
                  <FileText size={24} color="#db2777" />
                </View>
                <Text style={styles.actionLabel}>Assignments</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/live')}>
                <View style={[styles.actionIcon, { backgroundColor: '#fff7ed' }]}>
                  <Video size={24} color="#ea580c" />
                </View>
                <Text style={styles.actionLabel}>Live Class</Text>
              </TouchableOpacity>

            </>
          )}

          {(user?.role === 'FACULTY' || user?.role === 'TEACHER') && (
            <>
              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/timetable')}>
                <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
                  <Calendar size={24} color="#2563eb" />
                </View>
                <Text style={styles.actionLabel}>My Schedule</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/attendance-logs')}>
                <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
                  <Users size={24} color="#16a34a" />
                </View>
                <Text style={styles.actionLabel}>Attendance</Text>
              </TouchableOpacity>
            </>
          )}

          {(user?.role === 'HOD' || user?.role === 'DEPT_ADMIN') && (
            <>
              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/faculty-directory')}>
                <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
                  <Users size={24} color="#2563eb" />
                </View>
                <Text style={styles.actionLabel}>Faculty</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/timetable')}>
                <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
                  <Calendar size={24} color="#16a34a" />
                </View>
                <Text style={styles.actionLabel}>Dept Schedule</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(tabs)/labs')}>
            <View style={[styles.actionIcon, { backgroundColor: '#f5f3ff' }]}>
              <FlaskConical size={24} color="#7c3aed" />
            </View>
            <Text style={styles.actionLabel}>Virtual Lab</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/tutor')}>
            <View style={[styles.actionIcon, { backgroundColor: '#fff7ed' }]}>
              <Sparkles size={24} color="#ea580c" />
            </View>
            <Text style={styles.actionLabel}>AI Tutor</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleItem}>
            <View style={styles.timeCol}>
              <Text style={styles.time}>09:00</Text>
              <Text style={styles.ampm}>AM</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.courseCol}>
              <Text style={styles.courseName}>Pharmaceutics II</Text>
              <Text style={styles.room}>Lecture Hall 3</Text>
            </View>
          </View>
          <View style={styles.scheduleItem}>
            <View style={styles.timeCol}>
              <Text style={styles.time}>11:30</Text>
              <Text style={styles.ampm}>AM</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.courseCol}>
              <Text style={styles.courseName}>Pharmacognosy Lab</Text>
              <Text style={styles.room}>Virtual Lab Session</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  logoCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
  headerLogo: { width: '80%', height: '80%', resizeMode: 'contain' },
  welcome: { fontSize: 13, color: '#64748b' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  roleBadge: { backgroundColor: '#eff6ff', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginTop: 2 },
  roleText: { fontSize: 9, fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' },
  notificationBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16, marginTop: 8 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statLabel: { fontSize: 11, color: '#64748b' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 2 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionItem: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  actionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  scheduleCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  scheduleItem: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  timeCol: { width: 50, alignItems: 'center' },
  time: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  ampm: { fontSize: 10, color: '#64748b' },
  divider: { width: 2, height: 40, backgroundColor: '#f1f5f9', marginHorizontal: 16 },
  courseCol: { flex: 1 },
  courseName: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  room: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
