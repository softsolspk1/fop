import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { User, Mail, Lock, Phone, Hash, BookOpen, Clock, ArrowRight, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';

export default function SignupScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    shift: 'MORNING',
    year: '1st Year',
    rollNumber: '',
    enrollmentNumber: '',
    phoneNumber: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill all required fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await api.post('/auth/register', {
        ...formData,
        role: 'STUDENT'
      });
      alert('Registration successful! Please wait for admin approval.');
      router.replace('/login');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
           <Image 
             source={require('../assets/logo.png')} 
             style={styles.logo}
           />
        </View>
        <Text style={styles.title}>Student Signup</Text>
        <Text style={styles.subtitle}>Faculty of Pharmacy UOK</Text>
      </View>

      <View style={styles.form}>
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <User size={20} color="#64748b" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
          </View>
        </View>

        {/* Shift & Year Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Shift</Text>
             <View style={styles.inputWrapper}>
               <Clock size={20} color="#64748b" style={styles.icon} />
               <TextInput 
                style={styles.input}
                placeholder="Morning/Evening"
                value={formData.shift}
                onChangeText={(text) => setFormData({...formData, shift: text})}
              />
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Class</Text>
             <View style={styles.inputWrapper}>
               <BookOpen size={20} color="#64748b" style={styles.icon} />
               <TextInput 
                style={styles.input}
                placeholder="Year"
                value={formData.year}
                onChangeText={(text) => setFormData({...formData, year: text})}
              />
            </View>
          </View>
        </View>

        {/* Roll & Enrollment */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Roll Number / Form Number</Text>
          <View style={styles.inputWrapper}>
            <Hash size={20} color="#64748b" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="e.g. 23-PHA-124 or Form #1234"
              value={formData.rollNumber}
              onChangeText={(text) => setFormData({...formData, rollNumber: text})}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enrollment Number (Optional)</Text>
          <View style={styles.inputWrapper}>
            <Hash size={20} color="#64748b" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="e.g. UOK-EN-2023-144 (Optional)"
              value={formData.enrollmentNumber}
              onChangeText={(text) => setFormData({...formData, enrollmentNumber: text})}
            />
          </View>
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Phone size={20} color="#64748b" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="+92 XXX XXXXXXX"
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#64748b" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Email Address"
              autoCapitalize="none"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#64748b" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.signupBtn, isLoading && styles.signupBtnDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.signupBtnText}>Create Account</Text>
              <ArrowRight size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  signupBtn: {
    backgroundColor: '#2563eb',
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  signupBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLinkBold: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  signupBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#94a3b8',
    borderBottomWidth: 0,
    transform: [{ translateY: 1 }],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
