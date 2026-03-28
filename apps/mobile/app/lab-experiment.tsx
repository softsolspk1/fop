import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Play, RotateCcw, Save, CheckCircle2, FileText, ChevronLeft, Settings, Info, Beaker, FlaskConical, Thermometer, Gauge } from 'lucide-react-native';
import LabChart from '../components/LabChart';
import api from '../lib/api';
import { Colors, Card } from '../components/UI';

export default function LabExperimentScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<any>({ 
    rpm: 100, 
    tabletType: 'Immediate Release', 
    binder: 5, 
    ratio: '4:2:1',
    concentration: 50,
    temp: 37
  });
  const [result, setResult] = useState<any>(null);
  const [observation, setObservation] = useState('');
  const [studentResult, setStudentResult] = useState('');
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/labs/${id}/simulate`, inputs);
      setResult(data.results || data.resultData);
      setExperimentId(data.experimentId);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Simulation failed. Check parameters.');
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    if (!experimentId) {
      Alert.alert('Error', 'Please run simulation first.');
      return;
    }
    if (!observation || !studentResult) {
      Alert.alert('Error', 'Please fill in both Observation and Result.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/labs/experiments/${experimentId}/submit`, { 
        studentObservation: observation, 
        studentResult 
      });
      setSubmitted(true);
      Alert.alert('Success', 'Lab report submitted successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit lab report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
               <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
               <Text style={styles.headerLabel}>Virtual Experiment</Text>
               <Text style={styles.title} numberOfLines={1}>{title}</Text>
            </View>
            <TouchableOpacity style={styles.infoBtn}>
               <Info size={22} color={Colors.text} />
            </TouchableOpacity>
         </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
             <Settings size={18} color={Colors.primary} />
             <Text style={styles.sectionTitle}>Parameters</Text>
          </View>
          
          {String(title).includes('Dissolution') && (
            <View>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                   <Gauge size={14} color={Colors.textSecondary} />
                   <Text style={styles.label}>Stirring Speed (RPM)</Text>
                </View>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  value={String(inputs.rpm)}
                  onChangeText={(t) => setInputs({...inputs, rpm: parseInt(t) || 0})}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                   <Thermometer size={14} color={Colors.textSecondary} />
                   <Text style={styles.label}>Temperature (°C)</Text>
                </View>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  value={String(inputs.temp)}
                  onChangeText={(t) => setInputs({...inputs, temp: parseInt(t) || 0})}
                />
              </View>

              <Text style={styles.label}>Tablet Type</Text>
              <View style={styles.chipRow}>
                {['Immediate Release', 'Modified Release', 'Enteric Coated'].map(type => (
                  <TouchableOpacity 
                    key={type}
                    style={[styles.chip, inputs.tabletType === type && styles.activeChip]}
                    onPress={() => setInputs({...inputs, tabletType: type})}
                  >
                    <Text style={[styles.chipText, inputs.tabletType === type && styles.activeChipText]}>{type.split(' ')[0]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {String(title).includes('Tablet') && (
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                 <Beaker size={14} color={Colors.textSecondary} />
                 <Text style={styles.label}>Binder Percentage (%)</Text>
              </View>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={String(inputs.binder)}
                onChangeText={(t) => setInputs({...inputs, binder: parseFloat(t) || 0})}
              />
            </View>
          )}

          {String(title).includes('Emulsion') && (
            <View>
              <Text style={styles.label}>Oil:Water Ratio</Text>
              <View style={styles.chipRow}>
                {['4:2:1', '3:2:1', '2:2:1'].map(ratio => (
                  <TouchableOpacity 
                    key={ratio}
                    style={[styles.chip, inputs.ratio === ratio && styles.activeChip]}
                    onPress={() => setInputs({...inputs, ratio})}
                  >
                    <Text style={[styles.chipText, inputs.ratio === ratio && styles.activeChipText]}>{ratio}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.runBtn, { backgroundColor: loading ? Colors.primaryLight : Colors.primary }]} 
            onPress={runSimulation}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={Colors.primary} /> : (
              <>
                <Play size={20} color={Colors.white} fill={Colors.white} />
                <Text style={styles.runBtnText}>Start Simulation</Text>
              </>
            )}
          </TouchableOpacity>
        </Card>

        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <View style={styles.successIcon}>
                 <CheckCircle2 size={24} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.resultTitle}>Simulation Results</Text>
                <Text style={styles.resultSub}>Data generated successfully</Text>
              </View>
            </View>

            <Card style={styles.visualCard}>
              {Array.isArray(result) ? (
                <View style={styles.chartWrapper}>
                   <LabChart data={result} />
                </View>
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
            </Card>

            <Card style={styles.reportCard}>
              <View style={styles.sectionHeader}>
                 <FileText size={18} color={Colors.primary} />
                 <Text style={styles.sectionTitle}>Lab Report</Text>
              </View>
              
              <Text style={styles.label}>Observations</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                multiline
                placeholder="Describe what you observed during the process..."
                placeholderTextColor={Colors.textSecondary}
                value={observation}
                onChangeText={setObservation}
                editable={!submitted}
              />

              <Text style={styles.label}>Conclusion</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                multiline
                placeholder="State your final findings and conclusions..."
                placeholderTextColor={Colors.textSecondary}
                value={studentResult}
                onChangeText={setStudentResult}
                editable={!submitted}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: submitted ? '#10b981' : Colors.primary }]} 
                onPress={submitReport}
                disabled={loading || submitted}
              >
                {loading ? <ActivityIndicator color={Colors.white} /> : (
                  <>
                    <Save size={20} color={Colors.white} />
                    <Text style={styles.runBtnText}>{submitted ? 'Report Submitted' : 'Submit Lab Report'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </Card>
            
            <TouchableOpacity 
              style={styles.assessmentBtn}
              onPress={() => router.push({
                  pathname: '/lab-assessment',
                  params: { id, title }
              })}
            >
              <View style={styles.assessmentIcon}>
                 <FlaskConical size={20} color={Colors.white} />
              </View>
              <Text style={styles.assessmentBtnText}>Take Full Assessment</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { width: 44, height: 44, backgroundColor: Colors.slate50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  titleContainer: { flex: 1 },
  headerLabel: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 },
  title: { fontSize: 20, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  infoBtn: { width: 44, height: 44, backgroundColor: Colors.slate50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 60 },
  card: { margin: 24, padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: Colors.text, letterSpacing: -0.3 },
  inputGroup: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  label: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: Colors.slate50, borderRadius: 14, padding: 16, fontSize: 16, color: Colors.text, fontWeight: '700', borderWidth: 1, borderColor: Colors.border },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 16 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: Colors.slate50, borderWidth: 1, borderColor: Colors.border },
  activeChip: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700' },
  activeChipText: { color: Colors.primary, fontWeight: '900' },
  runBtn: { height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 },
  runBtnText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  resultContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  successIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  resultTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  resultSub: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700' },
  visualCard: { padding: 12, marginBottom: 24 },
  chartWrapper: { height: 260, borderRadius: 20, overflow: 'hidden' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.slate50, padding: 20, borderRadius: 20 },
  statLabel: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1 },
  statValue: { fontSize: 20, fontWeight: '900', color: Colors.primary, marginTop: 6 },
  resultText: { fontSize: 15, color: Colors.text, lineHeight: 24, fontWeight: '600' },
  reportCard: { padding: 20, marginBottom: 24 },
  submitBtn: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 },
  assessmentBtn: { height: 64, borderRadius: 20, backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  assessmentIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  assessmentBtnText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
});
