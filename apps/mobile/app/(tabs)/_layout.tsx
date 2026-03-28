import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, BookOpen, Bell, Settings, MessageSquare } from 'lucide-react-native';
import { Colors } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.secondary,
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        height: 64,
        paddingBottom: 10,
        paddingTop: 10,
        backgroundColor: Colors.white,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
