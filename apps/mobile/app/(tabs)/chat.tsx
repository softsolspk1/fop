import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MessageSquare, Users, ChevronRight, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';

export default function ChatScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<{ direct: any[], groups: any[] }>({ direct: [], groups: [] });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await api.get('/chat/sessions');
      setSessions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, isGroup }: { item: any, isGroup: boolean }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: '/chat-thread',
        params: { 
            partnerId: isGroup ? undefined : item.id,
            groupId: isGroup ? item.id : undefined,
            name: item.name
        }
      })}
    >
      <View style={[styles.avatar, { backgroundColor: isGroup ? '#eff6ff' : '#f8fafc' }]}>
        {isGroup ? <Users size={24} color="#2563eb" /> : <MessageSquare size={24} color="#64748b" />}
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtext}>{isGroup ? 'Group Chat' : item.role}</Text>
      </View>
      <ChevronRight size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const allSessions = [
    ...sessions.groups.map(g => ({ ...g, isGroup: true })),
    ...sessions.direct.map(d => ({ ...d, isGroup: false }))
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Direct & Course Groups</Text>
      </View>

      <FlatList
        data={allSessions}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => renderItem({ item, isGroup: item.isGroup })}
        keyExtractor={(item, index) => `${item.id}-${index}`}
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
  list: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  subtext: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
