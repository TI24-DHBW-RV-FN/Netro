import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const themeColors = {
    background: '#050510', // Ink Black
    surface: '#121225',    // Prussian Blue
    primary: '#8A2BE2',    // Blue Violet
    secondary: '#C595F1',  // Bright Lavender
    textMuted: '#E2CAF8',  // Thistle
    text: '#FFFFFF',       // White
    border: '#1B1B3A',
};

export const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColors.background, //
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: themeColors.surface, //
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: themeColors.text, //
    },
    feedContainer: {
        padding: 15,
    },
    postCard: {
        backgroundColor: themeColors.surface, //
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: themeColors.border,
        shadowColor: themeColors.primary, // Glow-Effekt
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: themeColors.primary, //
        marginRight: 10,
    },
    userName: {
        color: themeColors.text, //
        fontWeight: '600',
        fontSize: 16,
    },
    postTime: {
        color: themeColors.textMuted, //
        fontSize: 12,
    },
    postContent: {
        color: themeColors.text, //
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 15,
    },
    interactionBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: themeColors.border,
        paddingTop: 10,
        justifyContent: 'space-around',
    },
    interactionText: {
        color: themeColors.secondary, //
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});