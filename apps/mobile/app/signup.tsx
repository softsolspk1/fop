import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { User, Mail, Lock, Phone, Hash, BookOpen, Clock, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
           <Image 
             source={require('../assets/logo.jpg')} 
             style={styles.logo}
           />
        </View>
        <Text style={styles.title}>Student Signup</Text>
        <Text style={styles.subtitle}>Faculty of Pharmacy UOK</Text>
      </View>

      <View style={styles.form}>
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
          <Text style={styles.label}>Roll Number</Text>
          <View style={styles.inputWrapper}>
            <Hash size={20} color="#64748b" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="e.g. 23-PHA-124"
              value={formData.rollNumber}
              onChangeText={(text) => setFormData({...formData, rollNumber: text})}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enrollment Number</Text>
          <View style={styles.inputWrapper}>
            <Hash size={20} color="#64748b" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="e.g. UOK-EN-2023-144"
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
          style={styles.signupBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.signupBtnText}>Create Account</Text>
          <ArrowRight size={20} color="#fff" />
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
});
