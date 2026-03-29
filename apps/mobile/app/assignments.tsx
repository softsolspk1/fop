import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, FileText, Download, CheckCircle, Clock, ChevronRight } from 'lucide-react-native';
import * as Linking from 'expo-linking';
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

  const handleFileOpen = (url: string) => {
    if (!url) return Alert.alert('Error', 'No file URL available');
    const isDoc = url.match(/\.(docx|pptx|xlsx|pdf|doc|ppt|xls)$/i);
    const finalUrl = isDoc ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}` : url;
    Linking.openURL(finalUrl).catch(() => Alert.alert('Error', 'Could not open file'));
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

      <View style={styles.titleRow}>
        <Text style={styles.assTitle}>{item.title}</Text>
        {item.submissions?.length > 0 && (
          <View style={styles.submittedBadge}>
             <CheckCircle size={12} color={Colors.success} />
             <Text style={styles.submittedText}>Submitted</Text>
          </View>
        )}
      </View>
      <Text style={styles.assDesc} numberOfLines={2}>{item.description}</Text>

      <View style={styles.footer}>
        <Button 
          title="Resources" 
          icon={Download} 
          variant="surface" 
          onPress={() => item.fileUrl ? handleFileOpen(item.fileUrl) : Alert.alert('Notice', 'No resource file attached')}
          style={styles.actionBtn}
        />
        <Button 
          title={item.submissions?.length > 0 ? "Submitted" : "Submit"} 
          icon={CheckCircle} 
          onPress={() => router.push({ pathname: '/submit-assignment', params: { id: item.id, title: item.title } })}
          style={styles.actionBtn}
          disabled={item.submissions?.length > 0}
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
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  list: { padding: 24, paddingBottom: 100 },
  card: { padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  courseBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  courseText: { fontSize: 10, fontWeight: '900', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  deadlineText: { fontSize: 11, color: '#ef4444', fontWeight: '900' },
  assTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, letterSpacing: -0.3, flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  submittedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  submittedText: { fontSize: 10, fontWeight: '900', color: Colors.success, textTransform: 'uppercase' },
  assDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 10, lineHeight: 20, fontWeight: '600' },
  footer: { flexDirection: 'row', gap: 12, marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: Colors.slate50 },
  actionBtn: { flex: 1, height: 52, borderRadius: 14 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textSecondary, fontSize: 18, fontWeight: '800', marginTop: 16 },
  emptySub: { color: Colors.border, fontSize: 14, fontWeight: '600', marginTop: 8 },
});
