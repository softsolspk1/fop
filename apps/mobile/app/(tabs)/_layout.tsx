import { Tabs } from 'expo-router';
import { LayoutDashboard, BookOpen, Video, User, FileText, FlaskConical, MessageSquare, Users } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#64748b',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        height: 60,
        paddingBottom: 10,
        paddingTop: 5,
      },
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        color: '#1e293b',
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      
      {(role === 'STUDENT' || role === 'FACULTY' || role === 'TEACHER') && (
        <Tabs.Screen
          name="courses"
          options={{
            title: 'Courses',
            tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
          }}
        />
      )}

      {(role === 'STUDENT' || role === 'FACULTY' || role === 'TEACHER') && (
        <Tabs.Screen
          name="live"
          options={{
            title: 'Live',
            tabBarIcon: ({ color }) => <Video size={24} color={color} />,
          }}
        />
      )}

      {(role === 'HOD' || role === 'DEPT_ADMIN' || role === 'FACULTY' || role === 'TEACHER') && (
        <Tabs.Screen
          name="faculty"
          options={{
            title: 'Faculty',
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          }}
        />
      )}

      <Tabs.Screen
        name="labs"
        options={{
          title: 'Virtual Lab',
          tabBarIcon: ({ color }) => <FlaskConical size={24} color={color} />,
        }}
      />

      {(role === 'STUDENT' || role === 'FACULTY' || role === 'TEACHER') && (
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
          }}
        />
      )}

      {role === 'STUDENT' && (
        <Tabs.Screen
          name="results"
          options={{
            title: 'Results',
            tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
          }}
        />
      )}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
