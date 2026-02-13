import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';


import {styles} from "../styles";

export default function DisplayView() {
    return (
        <View style={styles.background}>
            <View style={styles.container3}>
                <Text style={styles.gradientText}>Die Seite wird nun korrekt angezeigt!</Text>
            </View>
        </View>
    );
}