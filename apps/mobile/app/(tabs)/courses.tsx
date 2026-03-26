import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { BookOpen, ChevronRight, User, Search, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Colors, Card, Input } from '../../components/UI';

export default function CoursesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[Courses Fetch Error]:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const renderCourse = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: '/assignments', params: { courseId: item.id } })}
    >
      <Card style={styles.courseCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: Colors.primary + '10' }]}>
            <BookOpen size={24} color={Colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.courseCode}>{item.code}</Text>
            <Text style={styles.courseName} numberOfLines={1}>{item.name}</Text>
          </View>
          <ChevronRight size={20} color={Colors.secondary} />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metaInfo}>
            <User size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.teacher?.name || 'Faculty Member'}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.professional} Prof</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Courses</Text>
        <Text style={styles.subtitle}>{courses.length} Active Courses</Text>
        
        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <Input 
              icon={Search}
              placeholder="Search by name or code..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourse}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          loading ? (
             <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.empty}>
              <BookOpen size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No courses found</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 },
  searchRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  searchWrapper: { flex: 1 },
  searchInput: { marginBottom: 0 },
  filterBtn: { width: 56, height: 56, backgroundColor: Colors.white, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  list: { padding: 24, gap: 16, paddingBottom: 100 },
  courseCard: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  courseCode: { fontSize: 12, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase' },
  courseName: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  metaInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  badge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: Colors.white, textTransform: 'uppercase' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textSecondary, marginTop: 16, fontSize: 16 },
});
