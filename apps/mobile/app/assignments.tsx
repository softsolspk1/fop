import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, FileText, Download, CheckCircle2, Clock } from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card, Button } from '../components/UI';

export default function AssignmentsScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignments = async () => {
    try {
      const url = courseId ? `/assignments/course/${courseId}` : '/assignments';
      const { data } = await api.get(url);
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[Assignments Fetch Error]:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const renderAssignment = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.courseBadge}>
          <Text style={styles.courseText}>{item.course?.name || 'General'}</Text>
        </View>
        <View style={styles.deadlineRow}>
          <Clock size={12} color={Colors.danger} />
          <Text style={styles.deadlineText}>{new Date(item.dueDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <Text style={styles.assTitle}>{item.title}</Text>
      <Text style={styles.assDesc} numberOfLines={2}>{item.description}</Text>

      <View style={styles.footer}>
        <Button 
          title="Resources" 
          icon={Download} 
          variant="surface" 
          onPress={() => Alert.alert('Download', 'Resource download started...')}
          style={styles.actionBtn}
        />
        <Button 
          title="Submit" 
          icon={CheckCircle2} 
          onPress={() => Alert.alert('Submit', 'Submission portal opening...')}
          style={styles.actionBtn}
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Assignments</Text>
          <Text style={styles.subtitle}>{courseId ? 'Filtered by Course' : 'All Pending Tasks'}</Text>
        </View>
      </View>

      <FlatList
        data={assignments}
        renderItem={renderAssignment}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.empty}>
              <FileText size={48} color={Colors.border} />
              <Text style={styles.emptyText}>No pending assignments</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: Colors.surface, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary },
  list: { padding: 24, gap: 16, paddingBottom: 100 },
  card: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  courseBadge: { backgroundColor: Colors.primary + '10', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  courseText: { fontSize: 10, fontWeight: 'bold', color: Colors.primary, textTransform: 'uppercase' },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontSize: 12, color: Colors.danger, fontWeight: 'bold' },
  assTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  assDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 8 },
  footer: { flexDirection: 'row', gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: { flex: 1, height: 48 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, marginTop: 16 },
});
