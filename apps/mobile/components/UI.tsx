import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, TextInput, ActivityIndicator } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

// Professional HSL-based Color Palette
export const Colors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#16a34a',
  danger: '#ef4444',
  warning: '#f59e0b',
  background: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  textSecondary: '#64748b',
  white: '#ffffff',
};

// Premium Button Component
export const Button = ({ title, onPress, loading, icon: Icon, variant = 'primary', style }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    disabled={loading}
    style={[
      styles.button, 
      { backgroundColor: variant === 'primary' ? Colors.primary : Colors.surface },
      style
    ]}
  >
    {loading ? (
      <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} />
    ) : (
      <View style={styles.buttonContent}>
        {Icon && <Icon size={20} color={variant === 'primary' ? Colors.white : Colors.primary} />}
        <Text style={[styles.buttonText, { color: variant === 'primary' ? Colors.white : Colors.primary }]}>
          {title}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

// Premium Input Component
export const Input = ({ label, icon: Icon, ...props }: any) => (
  <View style={styles.inputGroup}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.inputWrapper}>
      {Icon && <Icon size={20} color={Colors.secondary} style={styles.inputIcon} />}
      <TextInput 
        style={styles.input} 
        placeholderTextColor={Colors.secondary}
        {...props} 
      />
    </View>
  </View>
);

// Professional Card Component
export const Card = ({ children, style }: any) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 15,
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
