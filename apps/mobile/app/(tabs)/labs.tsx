import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Search, FlaskConical, ChevronRight, Beaker } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';

export default function LabsScreen() {
  const router = useRouter();
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const { data } = await api.get('/labs');
      setLabs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLabs = labs.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.department.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Virtual Lab</Text>
        <Text style={styles.subtitle}>Interactive Pharmaceutics Experiments</Text>
        
        <View style={styles.searchBar}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search experiments..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredLabs}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({
              pathname: '/lab-experiment',
              params: { id: item.id, title: item.title }
            })}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.difficulty === 'Beginner' ? '#f0fdf4' : '#eff6ff' }]}>
              <FlaskConical size={24} color={item.difficulty === 'Beginner' ? '#16a34a' : '#2563eb'} />
            </View>
            <View style={styles.content}>
              <Text style={styles.dept}>{item.department}</Text>
              <Text style={styles.labTitle}>{item.title}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.difficulty}</Text>
                </View>
                {item.experiments?.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: '#f0fdf4' }]}>
                    <Text style={[styles.badgeText, { color: '#16a34a' }]}>Completed</Text>
                  </View>
                )}
              </View>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Beaker size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No experiments found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 16, marginTop: 20, height: 48 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1e293b' },
  list: { padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconContainer: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 16 },
  dept: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  labTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 4 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: '#94a3b8', fontSize: 16 },
});
