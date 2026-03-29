import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FileText, ClipboardList, Zap, Clock, ChevronLeft, Filter, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Card } from '../components/UI';

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('resources'); // resources, assignments, quizzes, submissions
  const [items, setItems] = useState<any[]>([]);

  const fetchData = async (tab: string) => {
    try {
      let endpoint = '';
      if (user?.role === 'STUDENT') {
        endpoint = '/assignments/submissions/my';
      } else {
        if (tab === 'resources') endpoint = '/courses/materials/my';
        else if (tab === 'assignments') endpoint = '/assignments/my';
        else if (tab === 'quizzes') endpoint = '/quizzes/my';
      }

      const { data } = await api.get(endpoint);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[History Fetch Error]:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData(activeTab);
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(activeTab);
  };

  const renderItem = (item: any) => {
    if (user?.role === 'STUDENT') {
      return (
        <Card key={item.id} style={styles.itemCard}>
           <View style={styles.itemHeader}>
              <View style={[styles.iconBox, { backgroundColor: Colors.success + '10' }]}>
                 <CheckCircle size={20} color={Colors.success} />
              </View>
              <View style={styles.itemInfo}>
                 <Text style={styles.itemTitle}>{item.assignment?.title}</Text>
                 <Text style={styles.itemName}>{item.assignment?.course?.name}</Text>
              </View>
              {item.grade && (
                <View style={styles.gradeBadge}>
                   <Text style={styles.gradeText}>{item.grade.score}</Text>
                </View>
              )}
           </View>
           <Text style={styles.itemDate}>Submitted on: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </Card>
      );
    }

    return (
      <Card key={item.id} style={styles.itemCard}>
         <View style={styles.itemHeader}>
            <View style={[styles.iconBox, { backgroundColor: activeTab === 'resources' ? Colors.primary + '10' : activeTab === 'assignments' ? '#fdf2f8' : Colors.secondary + '10' }]}>
               {activeTab === 'resources' ? <FileText size={20} color={Colors.primary} /> : 
                activeTab === 'assignments' ? <ClipboardList size={20} color="#db2777" /> : 
                <Zap size={20} color={Colors.secondary} />}
            </View>
            <View style={styles.itemInfo}>
               <Text style={styles.itemTitle}>{item.title}</Text>
               <Text style={styles.itemName}>{item.course?.name}</Text>
            </View>
         </View>
         <Text style={styles.itemDate}>Added on: {new Date(item.createdAt).toLocaleDateString()}</Text>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Activity History</Text>
          <Text style={styles.subtitle}>{user?.role === 'STUDENT' ? 'Your Submissions' : 'Your Shared Content'}</Text>
        </View>
      </View>

      {user?.role !== 'STUDENT' && (
        <View style={styles.tabs}>
           {['resources', 'assignments', 'quizzes'].map((t) => (
             <TouchableOpacity 
               key={t}
               onPress={() => setActiveTab(t)}
               style={[styles.tab, activeTab === t && styles.activeTab]}
             >
                <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>{t}</Text>
             </TouchableOpacity>
           ))}
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : items.length === 0 ? (
          <View style={styles.empty}>
             <Clock size={48} color={Colors.border} />
             <Text style={styles.emptyText}>No activity found</Text>
          </View>
        ) : (
          items.map(renderItem)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  tabs: { flexDirection: 'row', backgroundColor: Colors.slate50, margin: 24, marginBottom: 0, padding: 4, borderRadius: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  tabText: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase' },
  activeTabText: { color: Colors.primary },
  scroll: { padding: 24, paddingBottom: 100 },
  itemCard: { padding: 16, marginBottom: 12 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  itemName: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginTop: 2 },
  itemDate: { fontSize: 10, color: Colors.border, fontWeight: '700', marginTop: 12, textTransform: 'uppercase' },
  gradeBadge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.success + '10', borderRadius: 8 },
  gradeText: { fontSize: 12, fontWeight: '900', color: Colors.success },
  empty: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '800', color: Colors.textSecondary }
});
