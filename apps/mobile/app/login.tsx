import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
        return Alert.alert('Error', 'Please fill in all fields');
    }
    setLoading(true);
    try {
        await login(formData.email, formData.password);
        router.replace('/(tabs)');
    } catch (error: any) {
        Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
           <Image 
             source={require('../assets/logo.png')} 
             style={styles.logo}
           />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to KU Portal</Text>
      </View>

      <View style={styles.form}>
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
          style={styles.loginBtn}
          onPress={handleLogin}
        >
          <Text style={styles.loginBtnText}>Sign In</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signupLink}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.signupLinkText}>Don't have an account? <Text style={styles.signupLinkBold}>Register Now</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 60,
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 24,
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
    padding: 30,
    marginTop: 20,
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
    height: 56,
    fontSize: 15,
    color: '#1e293b',
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  signupLinkText: {
    fontSize: 14,
    color: '#64748b',
  },
  signupLinkBold: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
