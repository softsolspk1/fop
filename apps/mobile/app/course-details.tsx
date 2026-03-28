import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  BookOpen, 
  Video, 
  FileText, 
  ClipboardList, 
  ChevronLeft, 
  User, 
  Clock, 
  MoreVertical,
  Plus,
  Play,
  Download,
  Calendar,
  Zap
} from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card, Button } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources'); // resources, assignments, attendance

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);
        
        // Find if there's any active class
        const now = new Date();
        const liveClass = data.classes?.find((c: any) => {
           const start = new Date(c.startTime);
           const end = new Date(c.endTime);
           return now >= start && now <= end;
        });
        setActiveSession(liveClass);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return (
     <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
     </View>
  );

  return (
    <View style={styles.container}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
           <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={24} color={Colors.text} />
           </TouchableOpacity>
           <Text style={styles.headerTitle} numberOfLines={1}>{course.code}</Text>
           <TouchableOpacity style={styles.moreBtn}>
              <MoreVertical size={24} color={Colors.text} />
           </TouchableOpacity>
        </View>
        
        <View style={styles.courseHero}>
           <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{course.name}</Text>
              <View style={styles.teacherRow}>
                 <User size={14} color={Colors.textSecondary} />
                 <Text style={styles.teacherName}>{course.teacher?.name || 'Faculty Member'}</Text>
              </View>
           </View>
           <View style={styles.heroIconBox}>
              <BookOpen size={40} color={Colors.primary} />
           </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
         {/* Live Session Alert */}
         {activeSession ? (
            <TouchableOpacity onPress={() => router.push({ pathname: '/live', params: { id: activeSession.id, courseId: id } })}>
               <Card style={styles.liveCard}>
                  <View style={styles.liveLeft}>
                     <View style={styles.pulseBox}>
                        <View style={styles.pulse} />
                        <Zap size={20} color={Colors.white} />
                     </View>
                     <View>
                        <Text style={styles.liveTitle}>Live Session Active</Text>
                        <Text style={styles.liveSubtitle}>{activeSession.title}</Text>
                     </View>
                  </View>
                  <View style={styles.joinBtn}>
                     <Play size={16} color={Colors.primary} fill={Colors.primary} />
                     <Text style={styles.joinText}>Join</Text>
                  </View>
               </Card>
            </TouchableOpacity>
         ) : (
            <Card style={styles.upcomingCard}>
               <Clock size={20} color={Colors.secondary} />
               <Text style={styles.upcomingText}>No active live sessions</Text>
               <TouchableOpacity style={styles.scheduleBtn}>
                  <Calendar size={18} color={Colors.primary} />
               </TouchableOpacity>
            </Card>
         )}

         {/* Navigation Tabs */}
         <View style={styles.tabs}>
            {['resources', 'assignments', 'attendance'].map((tab) => (
               <TouchableOpacity 
                 key={tab}
                 onPress={() => setActiveTab(tab)}
                 style={[styles.tab, activeTab === tab && styles.activeTab]}
               >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                     {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
               </TouchableOpacity>
            ))}
         </View>

         {/* Tab Content */}
         <View style={styles.tabContent}>
            {activeTab === 'resources' && (
               <View style={styles.list}>
                  {course.materials?.map((m: any) => (
                     <Card key={m.id} style={styles.itemCard}>
                        <View style={styles.itemIconBox}>
                           <FileText size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.itemInfo}>
                           <Text style={styles.itemTitle}>{m.title}</Text>
                           <Text style={styles.itemDate}>{new Date(m.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <TouchableOpacity style={styles.downloadBtn}>
                           <Download size={20} color={Colors.secondary} />
                        </TouchableOpacity>
                     </Card>
                  ))}
                  {(!course.materials || course.materials.length === 0) && (
                     <View style={styles.empty}>
                        <Text style={styles.emptyText}>No resources shared yet</Text>
                     </View>
                  )}
               </View>
            )}

            {activeTab === 'assignments' && (
               <View style={styles.list}>
                  {course.assignments?.map((a: any) => (
                     <Card key={a.id} style={styles.itemCard}>
                        <View style={[styles.itemIconBox, { backgroundColor: '#fdf2f8' }]}>
                           <ClipboardList size={20} color="#db2777" />
                        </View>
                        <View style={styles.itemInfo}>
                           <Text style={styles.itemTitle}>{a.title}</Text>
                           <Text style={styles.itemDate}>Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No date'}</Text>
                        </View>
                        <ChevronRight size={20} color={Colors.border} />
                     </Card>
                  ))}
                  {(!course.assignments || course.assignments.length === 0) && (
                     <View style={styles.empty}>
                        <Text style={styles.emptyText}>No assignments posted</Text>
                     </View>
                  )}
               </View>
            )}
         </View>
      </ScrollView>

      {/* Action FAB for Teachers */}
      {['FACULTY', 'HOD', 'MAIN_ADMIN'].includes(user?.role || '') && (
         <TouchableOpacity style={styles.fab}>
            <Plus size={28} color={Colors.white} />
         </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: Colors.text, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  moreBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: Colors.textSecondary, flex: 1, textAlign: 'center', marginHorizontal: 16, textTransform: 'uppercase', letterSpacing: 1 },
  courseHero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  heroInfo: { flex: 1, paddingRight: 20 },
  heroName: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -0.5, lineHeight: 32 },
  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  teacherName: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  heroIconBox: { width: 80, height: 80, backgroundColor: Colors.primaryLight, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 24, paddingBottom: 100 },
  liveCard: { backgroundColor: Colors.primary, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  liveLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  pulseBox: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  pulse: { position: 'absolute', width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.white, opacity: 0.3 },
  liveTitle: { color: Colors.white, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  liveSubtitle: { color: Colors.white, fontSize: 16, fontWeight: '700', marginTop: 2 },
  joinBtn: { backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  joinText: { color: Colors.primary, fontWeight: '900', fontSize: 12, textTransform: 'uppercase' },
  upcomingCard: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, backgroundColor: Colors.slate50, borderStyle: 'dashed', borderWidth: 2, borderColor: Colors.border },
  upcomingText: { flex: 1, fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  scheduleBtn: { padding: 8, backgroundColor: Colors.white, borderRadius: 10 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.slate50, padding: 6, borderRadius: 20, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
  activeTab: { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  tabText: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  activeTabText: { color: Colors.primary },
  tabContent: { flex: 1 },
  list: { gap: 12 },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  itemIconBox: { width: 44, height: 44, backgroundColor: Colors.primaryLight, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  itemDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  downloadBtn: { padding: 8 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 32, right: 32, width: 64, height: 64, backgroundColor: Colors.primary, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 },
});
