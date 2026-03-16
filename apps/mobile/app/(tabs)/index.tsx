import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Video, BookOpen, Clock, Bell } from 'lucide-react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>Ali Khan</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell size={24} color="#64748b" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Info Card - Official Branding */}
      <View style={styles.brandCard}>
        <View style={styles.brandInfo}>
           <Image 
             source={require('../../assets/logo.jpg')} 
             style={styles.logo}
           />
           <View style={{ flex: 1 }}>
             <Text style={styles.brandTitle}>Faculty of Pharmacy</Text>
             <Text style={styles.brandSubtitle}>University of Karachi</Text>
           </View>
        </View>
      </View>

      {/* Live Class Banner */}
      <TouchableOpacity style={styles.liveBanner}>
        <View style={styles.liveIconContainer}>
          <Video size={24} color="#fff" />
        </View>
        <View style={styles.liveContent}>
          <Text style={styles.liveTitle}>Live Today: Advanced Pharmacology</Text>
          <Text style={styles.liveTime}>Starts in 15 minutes • Dr. Sarah</Text>
        </View>
      </TouchableOpacity>

      {/* Stats Section */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>6</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>94%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3.8</Text>
          <Text style={styles.statLabel}>GPA</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Lectures</Text>
        {[1, 2].map((i) => (
          <View key={i} style={styles.lectureCard}>
            <View style={styles.lectureIcon}>
              <Clock size={20} color="#3b82f6" />
            </View>
            <View style={styles.lectureInfo}>
              <Text style={styles.lectureTitle}>Medicinal Chemistry</Text>
              <Text style={styles.lectureTime}>Tomorrow, 10:00 AM</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  notificationDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  brandCard: {
    margin: 24,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  liveBanner: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#2563eb',
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  liveIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveContent: {
    flex: 1,
  },
  liveTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  liveTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  lectureCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  lectureIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lectureInfo: {
    flex: 1,
  },
  lectureTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  lectureTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});
