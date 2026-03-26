import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, Calendar, CheckCircle2, AlertCircle } from 'lucide-react-native';
import api from '../lib/api';

export default function FeesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const { data } = await api.get('/fees/my-fees');
      setFees(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderFeeItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.status === 'PAID' ? '#f0fdf4' : '#fef2f2' }]}>
          <CreditCard size={20} color={item.status === 'PAID' ? '#16a34a' : '#dc2626'} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.feeTitle}>{item.title}</Text>
          <Text style={styles.amount}>PKR {item.amount.toLocaleString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'PAID' ? '#f0fdf4' : '#fef2f2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'PAID' ? '#16a34a' : '#dc2626' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.cardFooter}>
        <View style={styles.infoRow}>
          <Calendar size={14} color="#64748b" />
          <Text style={styles.infoText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
        </View>
        {item.status === 'UNPAID' && (
          <TouchableOpacity style={styles.payBtn}>
            <Text style={styles.payBtnText}>View Voucher</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tuition & Fees</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={fees}
          renderItem={renderFeeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFees(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <CheckCircle2 size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>All fees are up to date</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  titleContainer: { flex: 1 },
  feeTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  amount: { fontSize: 14, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, color: '#64748b' },
  payBtn: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  payBtnText: { fontSize: 12, fontWeight: 'bold', color: '#2563eb' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16 },
});
