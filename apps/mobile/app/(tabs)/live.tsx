import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Video, Play, Calendar } from 'lucide-react-native';

export default function LiveScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Now</Text>
        <TouchableOpacity style={styles.activeCard}>
           <View style={styles.liveBadge}>
             <Text style={styles.liveText}>LIVE</Text>
           </View>
           <Text style={styles.activeTitle}>Advanced Pharmacology I</Text>
           <Text style={styles.activeSub}>Dr. Sarah Ahmed • 124 Students</Text>
           <View style={styles.joinBtn}>
             <Play size={20} color="#fff" fill="#fff" />
             <Text style={styles.joinText}>Join Session</Text>
           </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recorded Lectures</Text>
        {[1, 2, 3].map((i) => (
          <TouchableOpacity key={i} style={styles.recordedCard}>
            <View style={styles.recordedIcon}>
              <Video size={20} color="#64748b" />
            </View>
            <View style={styles.recordedInfo}>
              <Text style={styles.recordedTitle}>Pharmacokinetics Intro</Text>
              <Text style={styles.recordedDate}>March {15-i}, 2026</Text>
            </View>
          </TouchableOpacity>
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
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  activeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  liveBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  activeTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activeSub: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 24,
  },
  joinBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  joinText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordedCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  recordedIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordedInfo: {
    flex: 1,
    marginLeft: 16,
  },
  recordedTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  recordedDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});
