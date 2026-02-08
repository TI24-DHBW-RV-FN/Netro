import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: '#050510',
                borderTopColor: '#1B1B3A',
                height: 60
            },
            tabBarActiveTintColor: '#8A2BE2',
            tabBarInactiveTintColor: '#E2CAF8',
        }}>
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={require('../../assets/netro-icon.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: focused ? '#8A2BE2' : '#E2CAF8',
                                resizeMode: 'contain'
                            }}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}