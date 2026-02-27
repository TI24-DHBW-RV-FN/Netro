import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#050510', borderTopColor: '#1B1B3A', height: 60 },
            tabBarActiveTintColor: '#8A2BE2',
            tabBarInactiveTintColor: '#E2CAF8',
        }}>
            {/* Requirement: Reiter (Kalender) in der Navbar */}
            <Tabs.Screen
                name="kalender"
                options={{
                    title: 'Kalender',
                    tabBarIcon: ({ color }) => <Ionicons name="calendar" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
                }}
            />
        </Tabs>
    );
}