import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { User, Mail, Shield, LogOut, Settings, Bell, HelpCircle, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors, Card, Button } from '../../components/UI';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const ProfileItem = ({ icon: Icon, label, color = Colors.text }: any) => (
    <TouchableOpacity style={styles.item}>
      <View style={[styles.itemIcon, { backgroundColor: color + '10' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[styles.itemLabel, { color }]}>{label}</Text>
      <ChevronRight size={18} color={Colors.border} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarWrapper}>
            <Image source={require('../../assets/logo.png')} style={styles.avatar} />
          </View>
          <Text style={styles.name}>{user?.name || 'User Name'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.replace('_', ' ')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <Card style={styles.menuCard}>
          <ProfileItem icon={User} label="Personal Information" color={Colors.primary} />
          <View style={styles.divider} />
          <ProfileItem icon={Shield} label="Security & Password" color={Colors.primary} />
          <View style={styles.divider} />
          <ProfileItem icon={Bell} label="Notifications" color={Colors.primary} />
        </Card>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Support & Info</Text>
        <Card style={styles.menuCard}>
          <ProfileItem icon={HelpCircle} label="Help Center" color={Colors.secondary} />
          <View style={styles.divider} />
          <ProfileItem icon={Settings} label="App Settings" color={Colors.secondary} />
        </Card>

        <Button 
          title="Sign Out"
          icon={LogOut}
          variant="surface"
          onPress={logout}
          style={styles.logoutBtn}
        />
        
        <Text style={styles.version}>Version 1.0.1 (Stable)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 40, paddingTop: 80, alignItems: 'center', backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  avatarWrapper: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.white, marginBottom: 16, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  profileInfo: { alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  email: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  roleBadge: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  roleText: { color: Colors.white, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  content: { padding: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  menuCard: { padding: 0, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  itemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  logoutBtn: { marginTop: 40, backgroundColor: Colors.danger + '10' },
  version: { textAlign: 'center', color: Colors.textSecondary, fontSize: 12, marginTop: 24, marginBottom: 40 },
});
