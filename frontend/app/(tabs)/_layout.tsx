import React from "react";
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

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
                name="Calendar"
                options={{
                    title: 'Calendar',
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

            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Image
                            source={require('../../assets/netro-icon.png')}
                            style={{
                                width: size,
                                height: size,
                                tintColor: color
                            }}
                        />
                    ),
                }}
            />

        </Tabs>
    );
}