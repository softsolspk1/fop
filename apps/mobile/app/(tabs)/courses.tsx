import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { BookOpen, ChevronRight, User } from 'lucide-react-native';

const courses = [
  { id: '1', name: 'Advanced Pharmacology I', code: 'PHA-501', instructor: 'Dr. Sarah Ahmed', department: 'Department of Pharmacology' },
  { id: '2', name: 'Biopharmaceutics', code: 'PHA-504', instructor: 'Dr. John Doe', department: 'Department of Pharmaceutics' },
  { id: '3', name: 'Medicinal Chemistry', code: 'PHA-507', instructor: 'Dr. Jane Smith', department: 'Department of Pharmaceutical Chemistry' },
  { id: '4', name: 'Clinical Pharmacy', code: 'PHA-602', instructor: 'Dr. Mike Wilson', department: 'Department of Pharmacy Practice' },
];

export default function CoursesScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.iconContainer}>
              <BookOpen size={24} color="#2563eb" />
            </View>
            <View style={styles.content}>
              <Text style={styles.code}>{item.code} • {item.department}</Text>
              <Text style={styles.title}>{item.name}</Text>
              <View style={styles.instructorRow}>
                <User size={14} color="#94a3b8" />
                <Text style={styles.instructor}>{item.instructor}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  list: {
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 16,
  },
  code: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  instructor: {
    fontSize: 12,
    color: '#64748b',
  },
});
