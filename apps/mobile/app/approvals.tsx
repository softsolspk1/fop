import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { CheckCircle, XCircle, Clock, FileText, ClipboardList, Zap } from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card } from '../components/UI';
import { useRouter } from 'expo-router';

export default function ApprovalsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);

  const fetchPending = async () => {
    try {
      const [matRes, quizRes] = await Promise.all([
        api.get('/materials?status=PENDING'),
        api.get('/quizzes/pending')
      ]);
      const merged = [
        ...(matRes.data || []).map((m: any) => ({ ...m, category: 'RESOURCE' })),
        ...(quizRes.data || []).map((q: any) => ({ ...q, category: 'QUIZ' }))
      ];
      setPendingItems(merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('[Approvals Error]:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: string, category: string, status: string) => {
    try {
      if (category === 'RESOURCE') {
        await api.put(`/materials/${id}/status`, { status });
      } else {
        await api.put(`/quizzes/${id}/status`, { status });
      }
      Alert.alert('Success', `Item ${status.toLowerCase()} successfully`);
      fetchPending();
    } catch (error) {
      Alert.alert('Error', 'Failed to update item status');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Approvals</Text>
        <Text style={styles.subtitle}>Review resources and assessments</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPending(); }} />}
      >
        {pendingItems.length === 0 && !loading ? (
          <View style={styles.empty}>
             <Clock size={48} color={Colors.textSecondary} opacity={0.3} />
             <Text style={styles.emptyText}>No pending items found</Text>
          </View>
        ) : (
          pendingItems.map((item) => (
            <Card key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={[styles.iconBox, { backgroundColor: item.category === 'RESOURCE' ? Colors.primary + '10' : Colors.secondary + '10' }]}>
                   {item.category === 'RESOURCE' ? <FileText size={20} color={Colors.primary} /> : <Zap size={20} color={Colors.secondary} />}
                </View>
                <View style={styles.itemInfo}>
                   <Text style={styles.itemTitle}>{item.title}</Text>
                   <Text style={styles.itemName}>{item.course?.name || 'Pharmacy Course'}</Text>
                </View>
              </View>

              <View style={styles.footer}>
                 <TouchableOpacity 
                   style={[styles.btn, styles.approveBtn]} 
                   onPress={() => handleAction(item.id, item.category, 'APPROVED')}
                 >
                    <CheckCircle size={16} color={Colors.white} />
                    <Text style={styles.btnText}>Approve</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   style={[styles.btn, styles.rejectBtn]} 
                   onPress={() => handleAction(item.id, item.category, 'REJECTED')}
                 >
                    <XCircle size={16} color={Colors.danger} />
                    <Text style={[styles.btnText, { color: Colors.danger }]}>Reject</Text>
                 </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginTop: 4 },
  scroll: { padding: 24, paddingBottom: 100 },
  itemCard: { padding: 20, marginBottom: 16, borderRadius: 24 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { marginLeft: 16, flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  itemName: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginTop: 2 },
  footer: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 44, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  approveBtn: { backgroundColor: Colors.primary },
  rejectBtn: { backgroundColor: Colors.danger + '10', borderWidth: 1, borderColor: Colors.danger + '20' },
  btnText: { fontSize: 12, fontWeight: '800', color: Colors.white },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, color: Colors.textSecondary, fontWeight: '700', fontSize: 14 }
});
