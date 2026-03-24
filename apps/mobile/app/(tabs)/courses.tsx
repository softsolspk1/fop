import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BookOpen, ChevronRight, User } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const yearToProfessional: Record<string, string> = {
  '1st Year': 'First',
  '2nd Year': 'Second',
  '3rd Year': 'Third',
  '4th Year': 'Fourth',
  '5th Year': 'Fifth',
};

export default function CoursesScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      if (!data || !Array.isArray(data)) {
        setCourses([]);
        return;
      }

      let filteredCourses = data;
      if (user?.role === 'STUDENT' && user?.year) {
        const requiredProf = yearToProfessional[user.year];
        if (requiredProf) {
          filteredCourses = data.filter((c: any) => c && c.professional === requiredProf);
        }
      }
      setCourses(filteredCourses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.iconContainer}>
              <BookOpen size={24} color="#2563eb" />
            </View>
            <View style={styles.content}>
              <Text style={styles.code}>{item.code} • {item.department?.name || 'Department'}</Text>
              <Text style={styles.title}>{item.name}</Text>
              <View style={styles.metaRow}>
                <User size={14} color="#94a3b8" />
                <Text style={styles.metaText}>{item.teacher?.name || 'No Instructor'}</Text>
              </View>
              {item.professional && (
                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.professional} Prof</Text>
                  </View>
                  {item.semesterName && (
                    <View style={styles.tagSemester}>
                      <Text style={styles.tagSemesterText}>{item.semesterName}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No courses available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  iconContainer: { width: 48, height: 48, backgroundColor: '#eff6ff', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 16 },
  code: { fontSize: 10, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  metaText: { fontSize: 12, color: '#64748b' },
  tagRow: { flexDirection: 'row', marginTop: 8, gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#f3e8ff', borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '700', color: '#7e22ce' },
  tagSemester: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#ffedd5', borderRadius: 6 },
  tagSemesterText: { fontSize: 10, fontWeight: '700', color: '#ea580c' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 40 },
});
