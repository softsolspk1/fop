import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Search, FlaskConical, ChevronRight, Beaker, Filter, MoreVertical, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';
import { Colors, Card } from '../../components/UI';

export default function LabsScreen() {
  const router = useRouter();
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const fetchLabs = useCallback(async () => {
    try {
      const { data } = await api.get('/labs');
      setLabs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLabs();
  };

  const filteredLabs = labs.filter(l => {
    const searchMatch = (l.title || '').toLowerCase().includes(search.toLowerCase());
    const deptMatch = selectedDept === 'All' || l.department === selectedDept;
    return searchMatch && deptMatch;
  });

  const DepartmentChip = ({ label }: { label: string }) => (
    <TouchableOpacity 
      onPress={() => setSelectedDept(label)}
      style={[styles.filterChip, selectedDept === label && styles.activeFilterChip]}
    >
      <Text style={[styles.filterText, selectedDept === label && styles.activeFilterText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
           <View>
              <Text style={styles.title}>Virtual Lab</Text>
              <Text style={styles.subtitle}>Interactive Experiments</Text>
           </View>
           <TouchableOpacity style={styles.moreBtn}>
              <MoreVertical size={24} color={Colors.text} />
           </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search experiments..."
              placeholderTextColor={Colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
             <Filter size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {['All', 'Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry', 'Pharmacognosy'].map(dept => (
              <DepartmentChip key={dept} label={dept} />
            ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
           <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredLabs}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <TouchableOpacity 
                style={styles.cardInner}
                onPress={() => router.push({
                  pathname: '/lab-experiment',
                  params: { id: item.id, title: item.title }
                })}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.difficulty === 'Beginner' ? '#f0fdf4' : Colors.primaryLight }]}>
                  <FlaskConical size={24} color={item.difficulty === 'Beginner' ? '#16a34a' : Colors.primary} />
                </View>
                <View style={styles.content}>
                  <Text style={styles.dept}>{item.department}</Text>
                  <Text style={styles.labTitle}>{item.title}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Star size={10} color={Colors.warning} style={{ marginRight: 4 }} />
                      <Text style={styles.badgeText}>{item.difficulty}</Text>
                    </View>
                    {item.experiments?.length > 0 && (
                      <View style={[styles.badge, { backgroundColor: '#f0fdf4' }]}>
                        <Text style={[styles.badgeText, { color: '#16a34a' }]}>Completed</Text>
                      </View>
                    )}
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.border} />
              </TouchableOpacity>
            </Card>
          )}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Beaker size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No experiments found</Text>
              <Text style={styles.emptySub}>Adjust your filters or try a different search.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  moreBtn: { width: 44, height: 44, backgroundColor: Colors.slate50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.slate50, borderRadius: 16, paddingHorizontal: 16, height: 52 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: Colors.text, fontWeight: '600' },
  filterBtn: { width: 52, height: 52, backgroundColor: Colors.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10 },
  filterRow: { gap: 8, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.slate50, borderWidth: 1, borderColor: Colors.border },
  activeFilterChip: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary },
  activeFilterText: { color: Colors.primary },
  list: { padding: 24, paddingBottom: 100 },
  card: { marginBottom: 16, padding: 0, overflow: 'hidden' },
  cardInner: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 16 },
  dept: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  labTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginTop: 4, letterSpacing: -0.3 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  badge: { backgroundColor: Colors.slate50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  badgeText: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.text, fontSize: 18, fontWeight: '900', marginTop: 24 },
  emptySub: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 8, textAlign: 'center' },
});
