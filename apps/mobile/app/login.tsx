import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Mail, Lock, LogIn, ChevronRight, UserPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Button, Input } from '../components/UI';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Required', 'Please enter both your email and password.');
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[Login Error]:', error);
      Alert.alert('Login failed', 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
           <View style={styles.logoCircle}>
              <Text style={styles.logoText}>K</Text>
           </View>
           <Text style={styles.title}>Welcome Back</Text>
           <Text style={styles.subtitle}>Sign in to your pharmacy portal</Text>
        </View>

        <View style={styles.form}>
           <Input 
             label="Email Address"
             icon={Mail}
             placeholder="name@university.edu"
             value={email}
             onChangeText={setEmail}
             autoCapitalize="none"
             keyboardType="email-address"
           />

           <Input 
             label="Password"
             icon={Lock}
             placeholder="••••••••"
             value={password}
             onChangeText={setPassword}
             secureTextEntry
           />

           <TouchableOpacity style={styles.forgotBtn} onPress={() => Alert.alert('Forgot Password', 'Please contact the administration office for assistance.')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
           </TouchableOpacity>

           <Button 
             title="Sign In to Portal" 
             onPress={handleLogin} 
             loading={loading}
             icon={LogIn}
             style={styles.submitBtn}
           />

           <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.replace('/signup')}>
                 <Text style={styles.footerLink}> Register Now</Text>
              </TouchableOpacity>
           </View>
        </View>

        {/* Feature Highlights */}
        <View style={styles.features}>
           <View style={styles.featureItem}>
              <View style={[styles.miniIcon, { backgroundColor: '#eff6ff' }]}>
                 <ChevronRight size={14} color="#2563eb" />
              </View>
              <Text style={styles.featureText}>Live Sessions & Classes</Text>
           </View>
           <View style={styles.featureItem}>
              <View style={[styles.miniIcon, { backgroundColor: '#f0fdf4' }]}>
                 <ChevronRight size={14} color="#16a34a" />
              </View>
              <Text style={styles.featureText}>Academic Records & Attendance</Text>
           </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: 32, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  logoCircle: { width: 72, height: 72, backgroundColor: Colors.primary, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 12 },
  logoText: { color: Colors.white, fontSize: 36, fontWeight: '900', fontStyle: 'italic' },
  title: { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  form: { width: '100%' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -8 },
  forgotText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  submitBtn: { height: 64, borderRadius: 20, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  features: { marginTop: 64, gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniIcon: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  featureText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
});
