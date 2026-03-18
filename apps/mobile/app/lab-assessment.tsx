import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, XCircle, Info } from 'lucide-react-native';
import api from '../lib/api';

export default function LabAssessmentScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchAssessment();
  }, []);

  const fetchAssessment = async () => {
    try {
      const { data } = await api.get(`/labs/${id}`);
      if (data.assessments && data.assessments.length > 0) {
        setAssessment(data.assessments[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = option;
    setAnswers(newAnswers);
  };

  const nextStep = () => {
    if (currentStep < assessment.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = async () => {
    let correctCount = 0;
    assessment.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correct) correctCount++;
    });
    const finalScore = (correctCount / assessment.questions.length) * 100;
    setScore(finalScore);
    
    try {
      await api.post(`/labs/${id}/assessment/${assessment.id}`, {
        answers,
        score: finalScore
      });
      setCompleted(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save results.');
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>Loading Assessment...</Text>
    </View>
  );

  if (!assessment) return (
    <View style={styles.center}>
      <XCircle size={64} color="#94a3b8" />
      <Text style={styles.emptyTitle}>No Assessment Found</Text>
      <Text style={styles.emptyText}>This lab experiment doesn't have a linked assessment yet.</Text>
      <TouchableOpacity style={styles.backBtnLarge} onPress={() => router.back()}>
        <Text style={styles.backBtnLargeText}>Return to Lab</Text>
      </TouchableOpacity>
    </View>
  );

  if (completed) {
    return (
      <View style={styles.container}>
        <View style={styles.resultView}>
          <CheckCircle2 size={80} color="#16a34a" />
          <Text style={styles.resultTitle}>Assessment Completed!</Text>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Final Score</Text>
            <Text style={styles.scoreVal}>{score}%</Text>
          </View>
          <TouchableOpacity style={styles.finishBtn} onPress={() => router.back()}>
            <Text style={styles.finishBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQ = assessment.questions[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Post-Lab Quiz</Text>
      </View>

      <View style={styles.progress}>
        <View style={[styles.progressBar, { width: `${((currentStep + 1) / assessment.questions.length) * 100}%` }]} />
        <Text style={styles.progressText}>Question {currentStep + 1} of {assessment.questions.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>{currentQ.q}</Text>
        <View style={styles.options}>
          {currentQ.a.map((opt: string) => (
            <TouchableOpacity 
              key={opt}
              style={[styles.option, answers[currentStep] === opt && styles.selectedOption]}
              onPress={() => handleSelect(opt)}
            >
              <Text style={[styles.optionText, answers[currentStep] === opt && styles.selectedOptionText]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.nextBtn, !answers[currentStep] && styles.disabledBtn]} 
        onPress={nextStep}
        disabled={!answers[currentStep]}
      >
        <Text style={styles.nextBtnText}>{currentStep === assessment.questions.length - 1 ? 'Finish' : 'Next Question'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, paddingTop: 60, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
  backBtn: { marginRight: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  progress: { padding: 24 },
  progressBar: { height: 6, backgroundColor: '#2563eb', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#64748b', marginTop: 8, fontWeight: 'bold' },
  card: { margin: 24, padding: 24, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  question: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 24 },
  options: { gap: 12 },
  option: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  selectedOption: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  optionText: { fontSize: 16, color: '#1e293b' },
  selectedOptionText: { color: '#2563eb', fontWeight: 'bold' },
  nextBtn: { margin: 24, height: 56, borderRadius: 16, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  disabledBtn: { opacity: 0.5 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultView: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 24 },
  scoreCard: { backgroundColor: '#fff', padding: 30, borderRadius: 30, alignItems: 'center', marginVertical: 30, width: '100%', borderWidth: 1, borderColor: '#f1f5f9' },
  scoreLabel: { fontSize: 14, color: '#64748b', textTransform: 'uppercase' },
  scoreVal: { fontSize: 64, fontWeight: '900', color: '#2563eb' },
  finishBtn: { backgroundColor: '#1e293b', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  finishBtnText: { color: '#fff', fontWeight: 'bold' },
  loadingText: { marginTop: 16, color: '#64748b', fontWeight: 'bold' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  backBtnLarge: { marginTop: 24, backgroundColor: '#f1f5f9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnLargeText: { color: '#1e293b', fontWeight: 'bold' },
});
