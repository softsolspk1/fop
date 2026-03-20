import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { User, Settings, LogOut, ChevronRight, BookOpen, Shield } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.role}>{user?.role?.replace('_', ' ')} • {user?.email}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <User size={20} color="#64748b" />
          </View>
          <Text style={styles.menuText}>Personal Information</Text>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#f0fdf4' }]}>
            <Shield size={20} color="#16a34a" />
          </View>
          <Text style={styles.menuText}>Privacy & Security</Text>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIconContainer, { backgroundColor: '#fff7ed' }]}>
            <Settings size={20} color="#ea580c" />
          </View>
          <Text style={styles.menuText}>Settings</Text>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2026 Faculty of Pharmacy UOK</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2563eb',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
  },
  role: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  menuContainer: {
    padding: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: '#94a3b8',
  },
  copyright: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 4,
  },
});
