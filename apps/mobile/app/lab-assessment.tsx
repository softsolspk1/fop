import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, XCircle, Info, HelpCircle, ArrowRight, Award, RotateCcw } from 'lucide-react-native';
import api from '../lib/api';
import { Colors, Card } from '../components/UI';

const { width } = Dimensions.get('window');

export default function LabAssessmentScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const fetchAssessment = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

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
    const finalScore = Math.round((correctCount / assessment.questions.length) * 100);
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
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Preparing Assessment...</Text>
    </View>
  );

  if (!assessment) return (
    <View style={styles.center}>
      <View style={styles.emptyIconBox}>
         <HelpCircle size={64} color={Colors.border} />
      </View>
      <Text style={styles.emptyTitle}>Assessment Pending</Text>
      <Text style={styles.emptyText}>An assessment for this experiment will be available soon. Please check back later.</Text>
      <TouchableOpacity style={styles.backBtnLarge} onPress={() => router.back()}>
        <Text style={styles.backBtnLargeText}>Return to Lab</Text>
      </TouchableOpacity>
    </View>
  );

  if (completed) {
    return (
      <View style={styles.container}>
        <View style={styles.resultView}>
          <View style={styles.successBadge}>
             <Award size={64} color={Colors.white} />
          </View>
          <Text style={styles.resultTitle}>Assessment Completed!</Text>
          <Text style={styles.resultSub}>Your performance has been recorded</Text>
          
          <Card style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Final Performance</Text>
            <View style={styles.scoreRow}>
               <Text style={styles.scoreVal}>{score}</Text>
               <Text style={styles.scorePercent}>%</Text>
            </View>
            <View style={styles.scoreStatus}>
               <CheckCircle2 size={16} color={score >= 50 ? '#10b981' : Colors.warning} />
               <Text style={[styles.statusText, { color: score >= 50 ? '#10b981' : Colors.warning }]}>
                  {score >= 80 ? 'Mastery Achieved' : score >= 50 ? 'Passed' : 'Review Required'}
               </Text>
            </View>
          </Card>

          <View style={styles.resultActions}>
             <TouchableOpacity style={styles.finishBtn} onPress={() => router.back()}>
                <Text style={styles.finishBtnText}>Go to Dashboard</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.retryBtn} onPress={() => {
                setCompleted(false);
                setCurrentStep(0);
                setAnswers([]);
             }}>
                <RotateCcw size={18} color={Colors.textSecondary} />
                <Text style={styles.retryText}>Retry Quiz</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const currentQ = assessment.questions[currentStep];
  const progressPercent = ((currentStep + 1) / assessment.questions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
           <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
             <ChevronLeft size={24} color={Colors.text} />
           </TouchableOpacity>
           <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Post-Lab Quiz</Text>
              <Text style={styles.headerSub} numberOfLines={1}>{title}</Text>
           </View>
           <View style={{ width: 44 }} />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
           <Text style={styles.progressLabel}>PROGRESS</Text>
           <Text style={styles.progressCount}>{currentStep + 1} / {assessment.questions.length}</Text>
        </View>
        <View style={styles.progressBase}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.qHeader}>
             <Text style={styles.qNumber}>Q{currentStep + 1}</Text>
             <Info size={18} color={Colors.border} />
          </View>
          <Text style={styles.question}>{currentQ.q}</Text>
          
          <View style={styles.options}>
            {currentQ.a.map((opt: string) => (
              <TouchableOpacity 
                key={opt}
                style={[styles.option, answers[currentStep] === opt && styles.selectedOption]}
                onPress={() => handleSelect(opt)}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, answers[currentStep] === opt && styles.selectedRadio]}>
                   {answers[currentStep] === opt && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.optionText, answers[currentStep] === opt && styles.selectedOptionText]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.nextBtn, !answers[currentStep] && styles.disabledBtn]} 
        onPress={nextStep}
        disabled={!answers[currentStep]}
      >
        <Text style={styles.nextBtnText}>
           {currentStep === assessment.questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
        </Text>
        <ArrowRight size={20} color={Colors.white} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, backgroundColor: Colors.slate50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700', marginTop: 2 },
  progressContainer: { paddingHorizontal: 24, marginTop: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  progressLabel: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1.5 },
  progressCount: { fontSize: 12, fontWeight: '900', color: Colors.primary },
  progressBase: { height: 8, backgroundColor: Colors.slate50, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  progressBar: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  scroll: { paddingBottom: 100 },
  card: { margin: 24, padding: 24 },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  qNumber: { fontSize: 13, fontWeight: '900', color: Colors.primary, backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  question: { fontSize: 20, fontWeight: '800', color: Colors.text, lineHeight: 28, marginBottom: 30, letterSpacing: -0.5 },
  options: { gap: 14 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.slate50 },
  selectedOption: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: Colors.border, marginRight: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  selectedRadio: { borderColor: Colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  optionText: { fontSize: 15, color: Colors.text, fontWeight: '600', flex: 1 },
  selectedOptionText: { color: Colors.primary, fontWeight: '800' },
  nextBtn: { position: 'absolute', bottom: 30, left: 24, right: 24, height: 64, borderRadius: 22, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
  disabledBtn: { opacity: 0.5 },
  nextBtnText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  resultView: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successBadge: { width: 120, height: 120, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 25 },
  resultTitle: { fontSize: 28, fontWeight: '900', color: Colors.text, marginTop: 32, letterSpacing: -1 },
  resultSub: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600', marginTop: 8 },
  scoreCard: { backgroundColor: Colors.white, padding: 32, borderRadius: 40, alignItems: 'center', marginVertical: 40, width: '100%' },
  scoreLabel: { fontSize: 12, fontWeight: '900', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  scoreVal: { fontSize: 80, fontWeight: '900', color: Colors.text, letterSpacing: -3 },
  scorePercent: { fontSize: 24, fontWeight: '900', color: Colors.primary, marginTop: 12, marginLeft: 2 },
  scoreStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: Colors.slate50, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  statusText: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  resultActions: { width: '100%', gap: 16 },
  finishBtn: { backgroundColor: Colors.text, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  finishBtnText: { color: Colors.white, fontWeight: '900', fontSize: 16 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50 },
  retryText: { color: Colors.textSecondary, fontWeight: '800', fontSize: 14 },
  loadingText: { marginTop: 16, color: Colors.textSecondary, fontWeight: '800', fontSize: 15 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 30, backgroundColor: Colors.slate50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 24, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 20, lineHeight: 22, fontWeight: '600' },
  backBtnLarge: { marginTop: 32, backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 18, borderRadius: 18, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  backBtnLargeText: { color: Colors.white, fontWeight: '900', fontSize: 15 },
});
