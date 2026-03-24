import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Building2, GraduationCap } from 'lucide-react-native';
import api from '../../lib/api';

export default function FacultyScreen() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const { data } = await api.get('/faculty');
      setFaculty(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={faculty}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.charAt(0) || '?'}</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.row}>
                    <GraduationCap size={14} color="#64748b" />
                    <Text style={styles.designation}>{item.designation || 'Faculty Member'}</Text>
                </View>
                {item.department ? (
                    <View style={styles.row}>
                        <Building2 size={14} color="#64748b" />
                        <Text style={styles.department}>{item.department}</Text>
                    </View>
                ) : null}
              </View>
            </View>
            {item.email && <Text style={styles.email}>{item.email}</Text>}
          </View>
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No faculty members found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  list: { padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#2563eb' },
  content: { marginLeft: 16, flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  designation: { fontSize: 13, color: '#64748b' },
  department: { fontSize: 13, color: '#64748b' },
  email: { marginTop: 12, fontSize: 13, color: '#2563eb', fontWeight: '500' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 40 },
});
