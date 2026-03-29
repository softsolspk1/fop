import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { User, Mail, Lock, UserPlus, GraduationCap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { Button, Input, Colors } from '../components/UI';

export default function SignupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    shift: 'MORNING',
    year: '1st Year',
    rollNumber: '',
    enrollmentNumber: '',
    phoneNumber: '',
    program: 'Pharm-D', // Default
  });

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.rollNumber || !form.phoneNumber) {
      return Alert.alert('Required', 'Please fill in all mandatory fields to register.');
    }

    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setIsRegistered(true);
      Alert.alert(
        'Registration Confirmed!', 
        'Your student account has been created successfully. You can now log in to access your courses and resources.', 
        [{ text: 'Proceed to Login', onPress: () => router.replace('/login') }]
      );
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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
             <Text style={styles.logoText}>K</Text>
          </View>
          <Text style={styles.title}>Registration</Text>
          <Text style={styles.subtitle}>Join the Faculty of Pharmacy portal</Text>
        </View>

        <View style={styles.form}>
          <Input 
            label="Student Full Name"
            icon={User}
            placeholder="e.g. Ali Ahmed"
            value={form.name}
            onChangeText={(t: string) => setForm({...form, name: t})}
          />

          <View style={styles.tabRow}>
             <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.miniLabel}>Shift</Text>
                <View style={styles.selector}>
                   {['MORNING', 'EVENING'].map((s) => (
                      <TouchableOpacity 
                        key={s} 
                        style={[styles.selBtn, form.shift === s && styles.selActive]}
                        onPress={() => setForm({...form, shift: s})}
                      >
                         <Text style={[styles.selText, form.shift === s && styles.selTextActive]}>{s[0]}</Text>
                      </TouchableOpacity>
                   ))}
                </View>
             </View>
              <View style={{ flex: 1.5, marginLeft: 8 }}>
                 <Text style={styles.miniLabel}>Program / Year</Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                   <View style={styles.selector}>
                      {['1st', '2nd', '3rd', '4th', '5th', 'M.Phil', 'PhD'].map((y) => (
                         <TouchableOpacity 
                           key={y} 
                           style={[styles.selBtn, (form.year.includes(y) || (y === 'M.Phil' && form.program === 'M.Phil') || (y === 'PhD' && form.program === 'PhD')) && styles.selActive]}
                           onPress={() => {
                             if (y === 'M.Phil' || y === 'PhD') {
                               setForm({...form, year: y, program: y});
                             } else {
                               setForm({...form, year: `${y} Year`, program: 'Pharm-D'});
                             }
                           }}
                         >
                            <Text style={[styles.selText, (form.year.includes(y) || (y === 'M.Phil' && form.program === 'M.Phil') || (y === 'PhD' && form.program === 'PhD')) && styles.selTextActive]}>{y}</Text>
                         </TouchableOpacity>
                      ))}
                   </View>
                 </ScrollView>
              </View>
          </View>
          
          <Input 
            label="Roll / Form Number"
            icon={GraduationCap}
            placeholder="e.g. 23-PHA-124"
            value={form.rollNumber}
            onChangeText={(t: string) => setForm({...form, rollNumber: t})}
          />

          <Input 
            label="Phone Number"
            icon={Mail} // Using mail as placeholder icon if phone missing in lib
            placeholder="+92 XXX XXXXXXX"
            value={form.phoneNumber}
            onChangeText={(t: string) => setForm({...form, phoneNumber: t})}
            keyboardType="phone-pad"
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
            title="Create Student Account" 
            onPress={handleSignup} 
            loading={loading}
            icon={UserPlus}
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
             <Text style={styles.footerText}>Already have an account?</Text>
             <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.footerLink}> Sign In</Text>
             </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 32, alignItems: 'center' },
  logoCircle: { width: 64, height: 64, backgroundColor: Colors.primary, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  logoText: { color: Colors.white, fontSize: 32, fontWeight: '900', fontStyle: 'italic' },
  title: { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  form: { width: '100%' },
  tabRow: { flexDirection: 'row', marginBottom: 24 },
  miniLabel: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  selector: { flexDirection: 'row', backgroundColor: Colors.slate50, borderRadius: 16, padding: 4, gap: 4 },
  selectorScroll: { backgroundColor: Colors.slate50, borderRadius: 16 },
  selBtn: { paddingHorizontal: 12, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  selActive: { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  selText: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary },
  selTextActive: { color: Colors.primary },
  submitBtn: { marginTop: 12, height: 60, borderRadius: 20, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 20 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, paddingBottom: 40 },
  footerText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
});
