import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { MessageSquare, Users, ChevronRight, Search, Plus, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';
import { Colors, Card, Input } from '../../components/UI';

export default function ChatScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<{ direct: any[], groups: any[] }>({ direct: [], groups: [] });
  const [search, setSearch] = useState('');

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/sessions');
      setSessions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const renderItem = ({ item, isGroup }: { item: any, isGroup: boolean }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/chat-thread',
        params: { 
            partnerId: isGroup ? undefined : item.id,
            groupId: isGroup ? item.id : undefined,
            name: item.name
        }
      })}
    >
       <Card style={styles.card}>
          <View style={[styles.avatarBox, { backgroundColor: isGroup ? Colors.primaryLight : Colors.slate50 }]}>
             {isGroup ? <Users size={24} color={Colors.primary} /> : <MessageSquare size={24} color={Colors.secondary} />}
             <View style={styles.onlineStatus} />
          </View>
          <View style={styles.content}>
             <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>12:45 PM</Text>
             </View>
             <Text style={styles.subtext} numberOfLines={1}>
                {isGroup ? 'Group Discussion • Join now' : `Role: ${item.role}`}
             </Text>
          </View>
          <ChevronRight size={18} color={Colors.border} />
       </Card>
    </TouchableOpacity>
  );

  const allSessions = [
    ...(sessions.groups || []).map(g => ({ ...g, isGroup: true })),
    ...(sessions.direct || []).map(d => ({ ...d, isGroup: false }))
  ].filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Collaborate with faculty & peers</Text>
        
        <View style={styles.searchRow}>
           <View style={styles.searchWrapper}>
              <Input 
                icon={Search}
                placeholder="Find a contact or group..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
           </View>
           <TouchableOpacity style={styles.newChatBtn}>
              <Plus size={24} color={Colors.white} />
           </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={allSessions}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => renderItem({ item, isGroup: item.isGroup })}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListEmptyComponent={
          loading ? (
             <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.empty}>
              <MessageSquare size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No active conversations</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4, marginBottom: 24 },
  searchRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  searchWrapper: { flex: 1 },
  searchInput: { marginBottom: 0 },
  newChatBtn: { width: 56, height: 56, backgroundColor: Colors.primary, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12 },
  list: { padding: 24, gap: 12, paddingBottom: 100 },
  card: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarBox: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  onlineStatus: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22c55e', borderWidth: 3, borderColor: Colors.surface },
  content: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '800', color: Colors.text },
  time: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
  subtext: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: Colors.textSecondary, marginTop: 16, fontSize: 16, fontWeight: '700' },
});
