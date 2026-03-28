import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bell, Megaphone, Calendar, Target, Loader2, ChevronRight, Filter } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Colors, Card } from '../../components/UI';

export default function AnnouncementsScreen() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const AnnouncementCard = ({ item }: { item: any }) => (
    <Card style={styles.annCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: Colors.primary + '15' }]}>
           <Megaphone size={20} color={Colors.primary} />
        </View>
        <View style={styles.headerInfo}>
           <Text style={styles.annTitle}>{item.title}</Text>
           <View style={styles.metaRow}>
              <Calendar size={10} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={[styles.metaText, { color: Colors.primary, fontWeight: '800' }]}>{item.sender.name}</Text>
           </View>
        </View>
      </View>
      
      <Text style={styles.annContent}>{item.content}</Text>
      
      <View style={styles.targetRow}>
         {item.targetRole ? (
            <View style={[styles.badge, { backgroundColor: '#eff6ff' }]}>
               <Text style={[styles.badgeText, { color: '#2563eb' }]}>{item.targetRole}</Text>
            </View>
         ) : (
            <View style={[styles.badge, { backgroundColor: '#f0fdf4' }]}>
               <Text style={[styles.badgeText, { color: '#16a34a' }]}>GLOBAL</Text>
            </View>
         )}
         {item.targetYear && (
            <View style={[styles.badge, { backgroundColor: '#f5f3ff' }]}>
               <Text style={[styles.badgeText, { color: '#7c3aed' }]}>{item.targetYear}</Text>
            </View>
         )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Text style={styles.headerTitle}>Bulletins</Text>
         <Text style={styles.headerSubtitle}>Official campus announcements</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.center}>
             <ActivityIndicator color={Colors.primary} size="large" />
             <Text style={styles.loadingText}>Loading Announcements...</Text>
          </View>
        ) : announcements.length === 0 ? (
          <View style={styles.center}>
             <Bell size={48} color={Colors.border} />
             <Text style={styles.emptyText}>No recent alerts</Text>
          </View>
        ) : (
          announcements.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  scroll: { padding: 20 },
  annCard: { marginBottom: 16, padding: 20 },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, justifyContent: 'center' },
  annTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  metaDivider: { fontSize: 11, color: Colors.border },
  annContent: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, fontWeight: '500' },
  targetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.slate100 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  center: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center', height: 400 },
  loadingText: { marginTop: 16, fontSize: 12, fontWeight: '800', color: Colors.secondary, textTransform: 'uppercase' },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '700', color: Colors.secondary },
});
