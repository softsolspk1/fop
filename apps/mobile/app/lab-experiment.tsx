import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Play, RotateCcw, Save, CheckCircle2, FileText } from 'lucide-react-native';
import LabChart from '../components/LabChart';
import api from '../lib/api';

export default function LabExperimentScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<any>({ rpm: 50, tabletType: 'Standard', binder: 5, oilRatio: 0.5 });
  const [result, setResult] = useState<any>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/labs/${id}/experiment`, { inputs });
      setResult(data.resultData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Interactive Simulation</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Parameters</Text>
        
        {String(title).includes('Dissolution') && (
          <View>
            <Text style={styles.label}>RPM (30-150)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={String(inputs.rpm)}
              onChangeText={(t) => setInputs({...inputs, rpm: parseInt(t) || 0})}
            />
            <Text style={styles.label}>Tablet Type</Text>
            <View style={styles.row}>
              {['Standard', 'Sustained'].map(type => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.chip, inputs.tabletType === type && styles.activeChip]}
                  onPress={() => setInputs({...inputs, tabletType: type})}
                >
                  <Text style={[styles.chipText, inputs.tabletType === type && styles.activeChipText]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {String(title).includes('Tablet') && (
          <View>
            <Text style={styles.label}>Binder Percentage (%)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={String(inputs.binder)}
              onChangeText={(t) => setInputs({...inputs, binder: parseInt(t) || 0})}
            />
          </View>
        )}

        <TouchableOpacity 
          style={styles.runBtn} 
          onPress={runSimulation}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Play size={20} color="#fff" />
              <Text style={styles.runBtnText}>Run Experiment</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <CheckCircle2 size={24} color="#16a34a" />
            <Text style={styles.resultTitle}>Simulation Results</Text>
          </View>

          {Array.isArray(result) ? (
            <LabChart data={result} />
          ) : typeof result === 'object' ? (
            <View style={styles.statGrid}>
              {Object.entries(result).map(([key, val]: [string, any]) => (
                <View key={key} style={styles.statCard}>
                  <Text style={styles.statLabel}>{key.toUpperCase()}</Text>
                  <Text style={styles.statValue}>{val}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.resultText}>{String(result)}</Text>
          )}
          
          <TouchableOpacity 
            style={styles.saveBtn}
            onPress={() => Alert.alert('Saved', 'Observation recorded in your Lab Notebook!')}
          >
            <Save size={20} color="#2563eb" />
            <Text style={styles.saveBtnText}>Save to Lab Notebook</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.runBtn, { marginTop: 12, backgroundColor: '#1e293b' }]}
            onPress={() => router.push({
                pathname: '/lab-assessment',
                params: { id, title }
            })}
          >
            <FileText size={20} color="#fff" />
            <Text style={styles.runBtnText}>Take Assessment</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  card: { margin: 16, padding: 20, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, fontSize: 16, color: '#1e293b' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  activeChip: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  chipText: { fontSize: 14, color: '#64748b' },
  activeChipText: { color: '#2563eb', fontWeight: 'bold' },
  runBtn: { backgroundColor: '#2563eb', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 },
  runBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  resultTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#2563eb', marginTop: 4 },
  resultText: { fontSize: 16, color: '#1e293b', lineHeight: 24, marginTop: 12 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, padding: 12 },
  saveBtnText: { color: '#2563eb', fontWeight: 'bold' },
});
