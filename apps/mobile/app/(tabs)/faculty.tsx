import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Building2, GraduationCap, Mail, ChevronRight, Search, MoreVertical } from 'lucide-react-native';
import api from '../../lib/api';
import { Colors, Card } from '../../components/UI';

export default function FacultyScreen() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFaculty = useCallback(async () => {
    try {
      const { data } = await api.get('/faculty');
      setFaculty(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFaculty([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFaculty();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
           <Text style={styles.title}>Faculty Directory</Text>
           <TouchableOpacity style={styles.moreBtn}>
              <MoreVertical size={24} color={Colors.text} />
           </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Our Academic Experts</Text>
      </View>

      <FlatList
        data={faculty}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.charAt(0) || '?'}</Text>
                <View style={styles.activeIndicator} />
              </View>
              <View style={styles.content}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.row}>
                    <GraduationCap size={14} color={Colors.textSecondary} />
                    <Text style={styles.designation}>{item.designation || 'Faculty Member'}</Text>
                </View>
                {item.department ? (
                    <View style={styles.row}>
                        <Building2 size={14} color={Colors.textSecondary} />
                        <Text style={styles.department}>{item.department}</Text>
                    </View>
                ) : null}
              </View>
              <ChevronRight size={18} color={Colors.border} />
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.emailRow}>
               <Mail size={14} color={Colors.primary} />
               <Text style={styles.email}>{item.email || 'N/A'}</Text>
            </TouchableOpacity>
          </Card>
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
             <GraduationCap size={64} color={Colors.border} />
             <Text style={styles.emptyText}>No faculty members found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  moreBtn: { width: 44, height: 44, backgroundColor: Colors.slate50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 24, paddingBottom: 100 },
  card: { padding: 20, marginBottom: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 20, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatarText: { fontSize: 28, fontWeight: '900', color: Colors.primary },
  activeIndicator: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#10b981', position: 'absolute', bottom: -2, right: -2, borderWidth: 3, borderColor: Colors.white },
  content: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, gap: 6 },
  designation: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  department: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.slate50, marginVertical: 16 },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.slate50, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  email: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '700', marginTop: 16 },
});
