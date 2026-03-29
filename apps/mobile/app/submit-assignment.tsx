import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Upload, FileText, CheckCircle, X } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../lib/api';
import { Colors, Button, Card } from '../components/UI';

export default function SubmitAssignmentScreen() {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<any>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    if (!file) return Alert.alert('Required', 'Please select a file first.');

    setLoading(true);
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      });

      await api.post(`/assignments/${id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Assignment submitted successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('[Submit Error]:', error);
      Alert.alert('Upload Failed', error.response?.data?.message || 'Failed to submit assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Submit Assignment</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{title}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Card style={styles.uploadCard}>
           {!file ? (
             <TouchableOpacity style={styles.pickerArea} onPress={pickDocument}>
                <View style={styles.iconCircle}>
                   <Upload size={32} color={Colors.primary} />
                </View>
                <Text style={styles.pickerTitle}>Select File</Text>
                <Text style={styles.pickerSub}>PDF or DOCX (Max 10MB)</Text>
             </TouchableOpacity>
           ) : (
             <View style={styles.filePreview}>
                <View style={styles.fileIconBox}>
                   <FileText size={32} color={Colors.primary} />
                </View>
                <View style={styles.fileMeta}>
                   <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                   <Text style={styles.fileSize}>{(file.size / (1024 * 1024)).toFixed(2)} MB</Text>
                </View>
                <TouchableOpacity onPress={() => setFile(null)} style={styles.removeBtn}>
                   <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
             </View>
           )}
        </Card>

        <View style={styles.guide}>
           <Text style={styles.guideTitle}>Guidelines</Text>
           <View style={styles.guideItem}>
              <CheckCircle size={14} color={Colors.success} />
              <Text style={styles.guideText}>Ensure the file is not password protected.</Text>
           </View>
           <View style={styles.guideItem}>
              <CheckCircle size={14} color={Colors.success} />
              <Text style={styles.guideText}>Double check your work before submitting.</Text>
           </View>
        </View>

        <Button 
          title="Push to Server" 
          onPress={handleSubmit} 
          loading={loading}
          disabled={!file}
          style={styles.submitBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { width: 48, height: 48, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1 },
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', marginTop: 2, textTransform: 'uppercase' },
  content: { padding: 24, flex: 1 },
  uploadCard: { padding: 0, borderRadius: 32, overflow: 'hidden', backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.slate50, borderStyle: 'dashed' },
  pickerArea: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 72, height: 72, backgroundColor: Colors.primaryLight, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  pickerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  pickerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 6, fontWeight: '600' },
  filePreview: { padding: 24, flexDirection: 'row', alignItems: 'center' },
  fileIconBox: { width: 60, height: 60, backgroundColor: Colors.slate50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  fileMeta: { flex: 1, marginLeft: 16 },
  fileName: { fontSize: 16, fontWeight: '800', color: Colors.text },
  fileSize: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  removeBtn: { padding: 8 },
  guide: { marginTop: 32, gap: 12 },
  guideTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  guideItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  guideText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  submitBtn: { marginTop: 'auto', height: 60, borderRadius: 20 },
});
