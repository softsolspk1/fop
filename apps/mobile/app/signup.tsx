import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { User, Mail, Lock, UserPlus, GraduationCap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { Button, Input, Colors } from '../components/UI';

export default function SignupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
  });

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.rollNumber) {
      return Alert.alert('Required', 'Please fill in all fields to register.');
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, role: 'STUDENT' });
      Alert.alert('Success', 'Account created successfully! Please sign in.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (error: any) {
      console.error('[Signup Error]:', error);
      const msg = error.response?.data?.message || 'Registration failed. Email or Roll Number might already exist.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Faculty of Pharmacy portal</Text>
        </View>

        <View style={styles.form}>
          <Input 
            label="Full Name"
            icon={User}
            placeholder="John Doe"
            value={form.name}
            onChangeText={(t: string) => setForm({...form, name: t})}
          />

          <Input 
            label="Roll Number"
            icon={GraduationCap}
            placeholder="2024-PH-001"
            value={form.rollNumber}
            onChangeText={(t: string) => setForm({...form, rollNumber: t})}
          />
          
          <Input 
            label="Email Address"
            icon={Mail}
            placeholder="name@university.edu"
            value={form.email}
            onChangeText={(t: string) => setForm({...form, email: t})}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <Input 
            label="Password"
            icon={Lock}
            placeholder="••••••••"
            value={form.password}
            onChangeText={(t: string) => setForm({...form, password: t})}
            secureTextEntry
          />

          <Button 
            title="Register Now" 
            onPress={handleSignup} 
            loading={loading}
            icon={UserPlus}
            style={styles.submitBtn}
          />

          <Button 
            title="Already have an account? Sign In" 
            variant="surface"
            onPress={() => router.replace('/login')}
            style={styles.loginBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 4 },
  form: { width: '100%' },
  submitBtn: { marginTop: 12 },
  loginBtn: { marginTop: 16, backgroundColor: Colors.surface },
});
