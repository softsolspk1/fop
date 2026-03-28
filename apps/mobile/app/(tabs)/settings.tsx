import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Switch } from 'react-native';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight, 
  BookOpen, 
  Award, 
  Phone,
  Mail,
  HelpCircle,
  Info
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Colors, Card } from '../../components/UI';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifsEnabled, setNotifsEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Do you want to sign out from the portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/login');
      }}
    ]);
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, isSwitch, switchValue, onSwitchChange }: any) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={onPress}
      disabled={isSwitch}
    >
       <View style={[styles.itemIcon, { backgroundColor: Colors.slate50 }]}>
          <Icon size={20} color={Colors.textSecondary} />
       </View>
       <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>{label}</Text>
          {value && <Text style={styles.itemValue}>{value}</Text>}
       </View>
       {isSwitch ? (
          <Switch 
            value={switchValue} 
            onValueChange={onSwitchChange} 
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
       ) : (
          <ChevronRight size={20} color={Colors.border} />
       )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Text style={styles.headerTitle}>Profile</Text>
         <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editText}>Edit</Text>
         </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
         {/* Profile Card */}
         <View style={styles.profileBox}>
            <View style={styles.avatarBox}>
               <View style={styles.avatarMain}>
                  <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
               </View>
               <View style={styles.roleBadge}>
                  <Shield size={10} color={Colors.white} fill={Colors.white} />
               </View>
            </View>
            <Text style={styles.profileName}>{user?.name || 'Portal User'}</Text>
            <Text style={styles.profileRole}>{user?.role?.replace('_', ' ')} • Pharmacy</Text>
         </View>

         {/* Stats Mini Row */}
         <View style={styles.miniStats}>
            <View style={styles.mStat}>
               <Text style={styles.mVal}>{user?.year || 'N/A'}</Text>
               <Text style={styles.mLab}>Year</Text>
            </View>
            <View style={[styles.mStat, styles.mBorder]}>
               <Text style={styles.mVal}>{user?.professional || '1st'}</Text>
               <Text style={styles.mLab}>Prof</Text>
            </View>
            <View style={styles.mStat}>
               <Text style={styles.mVal}>Active</Text>
               <Text style={styles.mLab}>Status</Text>
            </View>
         </View>

         <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Info</Text>
            <Card style={styles.sectionCard}>
               <SettingItem icon={Mail} label="Email Address" value={user?.email} />
               <SettingItem icon={Phone} label="Mobile Number" value={user?.phoneNumber || '+92 XXX XXXXXXX'} />
               <SettingItem icon={Award} label="Department" value="Faculty of Pharmacy" />
            </Card>
         </View>

         <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <Card style={styles.sectionCard}>
               <SettingItem 
                 icon={Bell} 
                 label="Push Notifications" 
                 isSwitch 
                 switchValue={notifsEnabled} 
                 onSwitchChange={setNotifsEnabled} 
               />
               <SettingItem icon={HelpCircle} label="Support Center" />
               <SettingItem icon={Info} label="About Portal" value="v1.0.0" />
            </Card>
         </View>

         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out from Device</Text>
         </TouchableOpacity>

         <Text style={styles.versionText}>Refreshed Build • softsols.pk</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  editBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  editText: { color: Colors.primary, fontWeight: '800', fontSize: 13 },
  scroll: { paddingBottom: 60 },
  profileBox: { alignItems: 'center', paddingVertical: 40, backgroundColor: Colors.surface, borderBottomLeftRadius: 48, borderBottomRightRadius: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  avatarBox: { width: 110, height: 110, marginBottom: 24 },
  avatarMain: { width: '100%', height: '100%', borderRadius: 36, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.3, shadowRadius: 20 },
  avatarText: { fontSize: 48, fontWeight: '900', color: Colors.white },
  roleBadge: { position: 'absolute', bottom: -5, right: -5, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fbbf24', borderWidth: 4, borderColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  profileName: { fontSize: 24, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  profileRole: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  miniStats: { flexDirection: 'row', marginTop: -35, marginHorizontal: 40, backgroundColor: Colors.white, borderRadius: 28, paddingVertical: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.08, shadowRadius: 30, elevation: 12 },
  mStat: { flex: 1, alignItems: 'center' },
  mBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.slate50 },
  mVal: { fontSize: 18, fontWeight: '900', color: Colors.text },
  mLab: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, textTransform: 'uppercase', marginTop: 4, letterSpacing: 0.5 },
  section: { paddingHorizontal: 24, marginTop: 48 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: Colors.text, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 8, marginBottom: 16, opacity: 0.4 },
  sectionCard: { padding: 4, borderRadius: 24 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  itemIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: 15, fontWeight: '800', color: Colors.text },
  itemValue: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { margin: 24, marginTop: 56, height: 68, borderRadius: 24, backgroundColor: '#fef2f2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { color: '#ef4444', fontWeight: '900', fontSize: 16, letterSpacing: -0.3 },
  versionText: { textAlign: 'center', fontSize: 11, fontWeight: '800', color: Colors.border, textTransform: 'uppercase', letterSpacing: 2, marginTop: 12 },
});
