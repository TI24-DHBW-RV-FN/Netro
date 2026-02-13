import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image,
    ActivityIndicator,
    Switch,
    Pressable,
    useColorScheme,
    Linking
} from 'react-native';
import { Sun, Moon, ExternalLink } from 'lucide-react-native'
import { createStyles, LIGHT_THEME, DARK_THEME, SPACING, RADIUS, FONTS } from './styles';

// Layout Component to showcase all design elements
export default function DesignSystemShowcase() {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
    const [inputValue, setInputValue] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [selectedChips, setSelectedChips] = useState<number[]>([0]);

    // Get theme based on mode
    const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;
    const styles = createStyles(theme);

    const toggleChip = (index: number) => {
        setSelectedChips(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.card}>

                    {/* Theme Toggle */}
                    <Pressable style={({ pressed }) => [ styles.themeToggleContainer, pressed && styles.themeTogglePressed]} onPress={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? (
                            <Moon size={24} color={theme.text.primary} />
                        ) : (
                            <Sun size={24} color={theme.text.primary} />
                        )}
                    </Pressable>
                </View>

                {/* Text */}
                <View style={styles.mb_xxl}>
                    <View style={styles.card}>
                        <Text style={[styles.gradientText, styles.mb_sm]}>Color Gradient</Text>
                        <Text style={[styles.h1, styles.mb_sm]}>Heading 1 - Display</Text>
                        <Text style={[styles.h2, styles.mb_sm]}>Heading 2 - Page Title</Text>
                        <Text style={[styles.h3, styles.mb_sm]}>Heading 3 - Section</Text>
                        <Text style={[styles.h4, styles.mb_base]}>Heading 4 - Subsection</Text>

                        <Text style={[styles.bodyLarge, styles.mb_sm]}>
                            Large body text - Perfect for introductions and important content that needs emphasis.
                        </Text>

                        <Text style={[styles.body, styles.mb_sm]}>
                            Regular body text - The standard text size for most content. Easy to read with optimal line spacing.
                        </Text>

                        <Text style={[styles.bodySecondary, styles.mb_sm]}>
                            Secondary body text - Used for supporting information and less critical details.
                        </Text>

                        <Text style={[styles.caption, styles.mb_sm]}>
                            Caption text - Perfect for metadata, timestamps, and small labels
                        </Text>

                        <Text style={[styles.captionBold, styles.mb_sm]}>
                            Caption bold - Emphasized small text
                        </Text>

                        <Text style={[styles.label, styles.mb_sm]}>Input Label</Text>

                        <Pressable onPress={() => Linking.openURL('https://example.com')} style={styles.linkContainer}>
                            {({ pressed }) => (
                                <>
                                    <Text style={[styles.link, pressed && styles.linkPressed]}>
                                        This is a clickable link
                                    </Text>
                                    <ExternalLink size={16} color={pressed ? theme.accent.secondary : theme.accent.primary} />
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}