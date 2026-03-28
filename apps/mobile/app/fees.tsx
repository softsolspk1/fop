import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, Calendar, CheckCircle2, AlertCircle, Download, MoreVertical } from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card } from '../components/UI';

export default function FeesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFees = useCallback(async () => {
    try {
      const { data } = await api.get('/fees/my-fees');
      setFees(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFees();
  };

  const renderFeeItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.status === 'PAID' ? '#f0fdf4' : '#fef2f2' }]}>
          <CreditCard size={22} color={item.status === 'PAID' ? '#16a34a' : '#dc2626'} />
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
          <Calendar size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity style={styles.payBtn}>
          <Download size={16} color={Colors.primary} />
          <Text style={styles.payBtnText}>Voucher</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
           <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
             <ChevronLeft size={24} color={Colors.text} />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Finance & Fees</Text>
           <TouchableOpacity style={styles.moreBtn}>
             <MoreVertical size={24} color={Colors.text} />
           </TouchableOpacity>
        </View>
        
        <View style={styles.balanceInfo}>
           <Text style={styles.balanceLabel}>Current Outstanding</Text>
           <Text style={styles.balanceValue}>PKR 0.00</Text>
           <View style={styles.upToDate}>
              <CheckCircle2 size={12} color={Colors.white} />
              <Text style={styles.upToDateText}>Account is Clear</Text>
           </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={fees}
          renderItem={renderFeeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <CreditCard size={64} color={Colors.border} />
              <Text style={styles.emptyText}>All fees are up to date</Text>
              <Text style={styles.emptySub}>Check back later for next semester dues.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  moreBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  balanceInfo: { backgroundColor: Colors.primary, padding: 24, borderRadius: 32, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  balanceLabel: { color: Colors.white, fontSize: 13, fontWeight: '700', opacity: 0.8 },
  balanceValue: { color: Colors.white, fontSize: 32, fontWeight: '900', marginTop: 4 },
  upToDate: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  upToDateText: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 24, paddingBottom: 100 },
  card: { padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  titleContainer: { flex: 1 },
  feeTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  amount: { fontSize: 14, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: Colors.slate50, marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  payBtn: { backgroundColor: Colors.primaryLight, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  payBtnText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.text, fontSize: 20, fontWeight: '900', marginTop: 24 },
  emptySub: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 8, textAlign: 'center' },
});
