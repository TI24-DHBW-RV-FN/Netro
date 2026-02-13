// Universal Styles

import {StyleSheet, Dimensions, Platform} from 'react-native';

export const COLORS = {
    // Base Colors from Palette
    inkBlack: '#050510',
    prussianBlue: '#121225',
    blueViolet: '#8A2BE2',
    brightLavender: '#C595F1',
    thistle: '#E2CAF8',
    white: '#FFFFFF',

    // Gradient Colors
    gradientStart: '#8A2BE2',
    gradientEnd: '#C595F1',

    // Glass Effect
    glassBackground: 'rgba(18, 18, 37, 0.8)',
    glassBorder: 'rgba(138, 43, 226, 0.3)',
    glassHighlight: 'rgba(255, 255, 255, 0.1)',

    // Text Colors
    textPrimary: '#FFFFFF',
    textSecondary: '#E2CAF8',
    textMuted: '#C595F1',

    // Accent Colors
    accentPrimary: '#8A2BE2',
    accentSecondary: '#C595F1',

    // Danger
    danger: '#FF4444',
    dangerGlass: 'rgba(255, 68, 68, 0.2)',

    // Color Gradient - Copy Pasten
    //import { LinearGradient } from 'expo-linear-gradient';
    /*<linearGradient>
        colors={['rgba(50,50,93,0.8', '#5f72bd', '#9b59b6']}
        start={{ x: 0, y: 0}},
        end={{x: 1, y: 1}}
    </linearGradient>*/

    // Gradient by Font
    // import MaskedView from '@react-native-masked-view/masked-view';
    /*<MaskedView
        style={{ height: 60, width: '100%' }} // Höhe an die Schriftgröße anpassen
        maskElement={
            <Text style={[styles.text2, { backgroundColor: 'transparent' }]}>
                Poppins
            </Text>
        }
    >
        <LinearGradient
            colors={['rgba(50,50,93,0.8)', '#5f72bd', '#9b59b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }} // Horizontaler Verlauf sieht bei Text oft besser aus
            style={StyleSheet.absoluteFill}
        />
    </MaskedView>*/

}

// Responsive Breakpoints
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;

// Spacing
const SPACING = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Border Radius
const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
};

// Font Sizes
const FONTS = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
};

// Styles
export const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: COLORS.inkBlack,
    },

    //View
    container1: {
        //flex: 1,
        alignItems: 'flex-start',
        gap: SPACING.md,
        margin: SPACING.md,
        padding: SPACING.sm,
        backgroundColor: COLORS.glassBackground,

        borderWidth: SPACING.xxs,
        borderBlockEndColor: COLORS.glassHighlight,
        borderRadius: RADIUS.md,

        position: 'relative',
        top: 0,


    },

    container2: {
        alignItems: 'flex-start',
        gap: SPACING.md,
        margin: SPACING.md,
        padding: SPACING.sm,
        backgroundColor: COLORS.glassBackground,
        borderRadius: RADIUS.md,

        position: 'relative',
        top: 0,
        // iOS Schatten-Eigenschaften
        shadowColor: 'rgba(50, 50, 93, 1)',
        shadowOffset: {
            width: 0,
            height: 30,
        },
        shadowOpacity: 0.25,
        shadowRadius: 50,

        // Android (Sehr eingeschränkt, kein RGBA-Support)
        elevation: 20,
    },

    container3: {
        width: 190,
        height: 254,
        borderRadius: 50,
        backgroundColor: COLORS.prussianBlue,
        alignItems: 'center',
        justifyContent: 'center',

        // Outer shadow (dark)
        shadowColor: COLORS.thistle,
        shadowOffset: {
            width: SPACING.xs,
            height: SPACING.xs,
        },
        shadowOpacity: 0.4,
        shadowRadius: 60,

        // Android
        elevation: 8,

        // Border for highlight effect
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',

        margin: SPACING.md,
        padding: SPACING.md,

        transform: [{ scale: 1.02 }],
    },
    //Text
    text1: {
        fontFamily: 'poppins',
        fontSize: FONTS.md,
        fontWeight: 'heavy',
        color: COLORS.inkBlack,
        textAlign: 'left',
        letterSpacing: 0.4,
    },

    text2: {
        fontFamily: 'poppins',
        fontSize: FONTS.xxl,
        fontWeight: 'bold',
    },

    gradientText: {
        fontFamily: 'poppins',
        fontSize: FONTS.xxl,
        fontWeight: 'bold',
        ...(Platform.OS === 'web' && {
            backgroundImage: 'linear-gradient(to right, #FF0080, #7928CA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
        }),
        ...Platform.select({
            ios: { color: '#FF0080' },
            android: { color: '#FF0080' },
        }),
    },
})