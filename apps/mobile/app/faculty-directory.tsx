import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, Phone, MapPin, Search, User } from 'lucide-react-native';
import api from '../lib/api';

export default function FacultyDirectoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const { data } = await api.get('/faculty');
      setFaculty(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderFacultyItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <User size={30} color="#64748b" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.designation}>{item.designation}</Text>
          <View style={styles.deptBadge}>
             <Text style={styles.deptText}>{item.department}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.contactBtn}>
          <Mail size={16} color="#2563eb" />
          <Text style={styles.contactText}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactBtn}>
          <Phone size={16} color="#2563eb" />
          <Text style={styles.contactText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Faculty Directory</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={faculty}
          renderItem={renderFacultyItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFaculty(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <User size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No faculty members found</Text>
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
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  designation: { fontSize: 14, color: '#64748b', marginTop: 2 },
  deptBadge: { backgroundColor: '#eff6ff', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  deptText: { fontSize: 10, fontWeight: 'bold', color: '#2563eb' },
  contactRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16, gap: 12 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', paddingVertical: 8, borderRadius: 10, gap: 8 },
  contactText: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16 },
});
 Jonah
