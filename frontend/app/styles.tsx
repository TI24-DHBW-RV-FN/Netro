import { StyleSheet, Dimensions, Platform } from "react-native";

const createTheme = (isDark: boolean) => ({
  background: {
    primary: isDark ? "#000000" : "#F1F3F5",
    secondary: isDark ? "#1A1A1A" : "#F8F9FA",
    tertiary: isDark ? "#2A2A2A" : "#F0F2F5",
    elevated: isDark ? "#1F1F1F" : "#FFFFFF",
  },

  text: {
    primary: isDark ? "#FFFFFF" : "#1A1A1A",
    secondary: isDark ? "#B8B8B8" : "#6B7280",
    tertiary: isDark ? "#808080" : "#9CA3AF",
    inverse: isDark ? "#1A1A1A" : "#FFFFFF",
  },

  accent: {
    primary: "#6C5CE7",
    secondary: "#A29BFE",
    cross: "#EF4444",
    gradient: {
      start: "#3a24e3",
      end: "#fe9bcd",
    },
  },

  border: {
    light: isDark ? "#2A2A2A" : "#E5E7EB",
    medium: isDark ? "#404040" : "#D1D5DB",
    strong: isDark ? "#525252" : "#9CA3AF",
  },

  interactive: {
    hover: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
    pressed: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    disabled: isDark ? "#404040" : "#E5E7EB",
  },

  status: {
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  },

  overlay: isDark ? "rgba(0, 0, 0, 0.85)" : "rgba(0, 0, 0, 0.5)",
  shadow: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)",
});

export const LIGHT_THEME = createTheme(false);
export const DARK_THEME = createTheme(true);

// Responsive Breakpoints
const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FONTS = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 34,
  display: 48,

  weights: {
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Styles
export const createStyles = (theme: ReturnType<typeof createTheme>) =>
  StyleSheet.create({
    // ============================================
    // LAYOUT CONTAINERS
    // ============================================

    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },

    safeArea: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },

    scrollContainer: {
      flexGrow: 1,
      backgroundColor: theme.background.primary,
    },

    themeToggleContainer: {
      width: SPACING.xxxl,
      height: SPACING.xxxl,
      borderRadius: RADIUS.full,
      backgroundColor: theme.background.secondary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border.light,
    },

    themeTogglePressed: {
      backgroundColor: theme.interactive.pressed,
    },
    // ============================================
    // CARDS
    // ============================================

    card: {
      backgroundColor: theme.background.elevated,
      borderRadius: RADIUS.lg,
      padding: SPACING.base,
      marginTop: SPACING.base,
      marginHorizontal: SPACING.base,
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    },

    cardScrollable: {
      backgroundColor: theme.background.elevated,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginTop: SPACING.base,
      marginHorizontal: SPACING.base,
      maxHeight: 400,
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    // ============================================
    // Text
    // ============================================

    h1: {
      fontSize: FONTS.xxxl,
      fontWeight: FONTS.weights.bold,
      color: theme.text.primary,
      lineHeight: FONTS.xxxl * FONTS.lineHeights.tight,
      letterSpacing: -0.5,
    },

    h2: {
      fontSize: FONTS.xxl,
      fontWeight: FONTS.weights.bold,
      color: theme.text.primary,
      lineHeight: FONTS.xxl * FONTS.lineHeights.tight,
      letterSpacing: -0.3,
    },

    h3: {
      fontSize: FONTS.xl,
      fontWeight: FONTS.weights.semibold,
      color: theme.text.primary,
      lineHeight: FONTS.xl * FONTS.lineHeights.normal,
    },

    h4: {
      fontSize: FONTS.lg,
      fontWeight: FONTS.weights.semibold,
      color: theme.text.primary,
      lineHeight: FONTS.lg * FONTS.lineHeights.normal,
    },

    bodyLarge: {
      fontSize: FONTS.md,
      fontWeight: FONTS.weights.regular,
      color: theme.text.primary,
      lineHeight: FONTS.md * FONTS.lineHeights.relaxed,
    },

    body: {
      fontSize: FONTS.base,
      fontWeight: FONTS.weights.regular,
      color: theme.text.primary,
      lineHeight: FONTS.base * FONTS.lineHeights.relaxed,
    },

    bodySecondary: {
      fontSize: FONTS.base,
      fontWeight: FONTS.weights.regular,
      color: theme.text.secondary,
      lineHeight: FONTS.base * FONTS.lineHeights.relaxed,
    },

    caption: {
      fontSize: FONTS.sm,
      fontWeight: FONTS.weights.regular,
      color: theme.text.tertiary,
      lineHeight: FONTS.sm * FONTS.lineHeights.normal,
    },

    captionBold: {
      fontSize: FONTS.sm,
      fontWeight: FONTS.weights.semibold,
      color: theme.text.secondary,
      lineHeight: FONTS.sm * FONTS.lineHeights.normal,
    },

    label: {
      fontSize: FONTS.sm,
      fontWeight: FONTS.weights.medium,
      color: theme.text.secondary,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
    },

    link: {
      fontSize: FONTS.base,
      fontWeight: FONTS.weights.semibold,
      color: theme.accent.primary,
      textDecorationColor: theme.accent.primary,
    },

    linkPressed: {
      color: theme.accent.secondary,
      textDecorationColor: theme.accent.secondary,
    },

    linkContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
    },

    // Gradient Text (for special headings)
    gradientText: {
      fontFamily: "poppins",
      fontSize: FONTS.xxl,
      fontWeight: FONTS.weights.bold,
      ...(Platform.OS === "web" && {
        backgroundImage: `linear-gradient(to right, ${theme.accent.gradient.start}, ${theme.accent.gradient.end})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }),
      ...Platform.select({
        ios: { color: theme.accent.primary },
        android: { color: theme.accent.primary },
      }),
    },

    // ============================================
    // BUTTONS
    // ============================================

    button: {
      backgroundColor: theme.accent.primary,
      borderRadius: RADIUS.full,
      paddingVertical: SPACING.base,
      paddingHorizontal: SPACING.xl,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
      ...Platform.select({
        ios: {
          shadowColor: theme.accent.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    },

    buttonText: {
      color: theme.text.inverse,
      fontSize: FONTS.base,
      fontWeight: FONTS.weights.semibold,
      letterSpacing: 0.3,
    },

    buttonSecondary: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: theme.border.medium,
      borderRadius: RADIUS.full,
      paddingVertical: SPACING.base,
      paddingHorizontal: SPACING.xl,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },

    buttonSecondaryText: {
      color: theme.text.primary,
      fontSize: FONTS.base,
      fontWeight: FONTS.weights.semibold,
      letterSpacing: 0.3,
    },

    buttonGhost: {
      backgroundColor: "transparent",
      width: 56,
      height: 56,
      borderRadius: 28,
      borderColor: theme.border.medium,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },

    buttonDisabled: {
      backgroundColor: theme.interactive.disabled,
      opacity: 0.6,
    },

    buttonSmall: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      minHeight: 36,
    },

    buttonLarge: {
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.xxl,
      minHeight: 56,
    },

    iconButton: {
      width: 44,
      height: 44,
      borderRadius: RADIUS.full,
      backgroundColor: theme.background.secondary,
      alignItems: "center",
      justifyContent: "center",
    },

    iconButtonPrimary: {
      width: 44,
      height: 44,
      borderRadius: RADIUS.full,
      backgroundColor: theme.accent.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    iconButtonSecondary: {
      width: 44,
      height: 44,
      borderRadius: RADIUS.full,
      backgroundColor: theme.accent.cross,
      alignItems: "center",
      justifyContent: "center",
    },

    // ============================================
    // INPUT FIELDS
    // ============================================

    inputContainer: {
      marginBottom: SPACING.base,
    },

    inputLabel: {
      fontSize: FONTS.sm,
      fontWeight: FONTS.weights.medium,
      color: theme.text.secondary,
      marginBottom: SPACING.xs,
    },

    inputError: {
      borderColor: theme.status.error,
      borderWidth: 1,
    },

    inputErrorText: {
      fontSize: FONTS.xs,
      color: theme.status.error,
      marginTop: SPACING.xs,
      fontWeight: FONTS.weights.medium,
    },

    textArea: {
      backgroundColor: theme.background.secondary,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: theme.border.light,
      paddingHorizontal: SPACING.base,
      paddingVertical: SPACING.md,
      fontSize: FONTS.base,
      color: theme.text.primary,
      minHeight: 120,
      textAlignVertical: "top",
    },

    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
    },

    inputIcon: {
      position: "absolute",
      left: SPACING.md,
      zIndex: 1,
    },

    inputIconTextArea: {
      position: "absolute",
      left: SPACING.md,
      top: SPACING.md,
      zIndex: 1,
    },

    inputWithIcon: {
      flex: 1,
      height: 48,
      backgroundColor: theme.background.secondary,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.base,
      paddingLeft: 44,
      fontSize: FONTS.base,
      color: theme.text.primary,
      borderWidth: 1,
      borderColor: theme.border.light,
    },

    textAreaWithIcon: {
      flex: 1,
      backgroundColor: theme.background.secondary,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.base,
      paddingLeft: 44,
      paddingVertical: SPACING.md,
      fontSize: FONTS.base,
      color: theme.text.primary,
      borderWidth: 1,
      borderColor: theme.border.light,
      minHeight: 100,
      textAlignVertical: "top",
    },

    inputButton: {
      position: "absolute",
      right: SPACING.md,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: RADIUS.sm,
      backgroundColor: theme.background.tertiary,
    },

    inputButtonPressed: {
      backgroundColor: theme.interactive.pressed,
      transform: [{ scale: 0.95 }],
    },

    // ============================================
    // LIST ITEMS
    // ============================================

    listItem: {
      backgroundColor: theme.background.elevated,
      borderRadius: RADIUS.lg,
      padding: SPACING.base,
      marginBottom: SPACING.md,
      marginHorizontal: SPACING.md,
      flexDirection: "row",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
    },

    listItemScrollable: {
      backgroundColor: theme.background.primary,
      borderRadius: RADIUS.lg,
      padding: SPACING.base,
      marginBottom: SPACING.md,
      marginHorizontal: SPACING.md,
      flexDirection: "row",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    listItemContent: {
      flex: 1,
      marginLeft: SPACING.md,
    },

    listItemTitle: {
      fontSize: FONTS.base,
      fontWeight: FONTS.weights.semibold,
      color: theme.text.primary,
      marginBottom: SPACING.xxs,
    },

    listItemSubtitle: {
      fontSize: FONTS.sm,
      color: theme.text.secondary,
    },

    listItemIcon: {
      width: 48,
      height: 48,
      borderRadius: RADIUS.md,
      backgroundColor: theme.background.secondary,
      alignItems: "center",
      justifyContent: "center",
    },

    // ============================================
    // AVATARS
    // ============================================

    avatar: {
      width: 120,
      height: 120,
      borderRadius: RADIUS.full,
      backgroundColor: theme.background.secondary,
      borderWidth: 3,
      borderColor: theme.accent.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    // ============================================
    // BADGES
    // ============================================

    badge: {
      backgroundColor: theme.accent.primary,
      borderRadius: RADIUS.full,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      minWidth: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },

    badgeText: {
      fontSize: FONTS.xs,
      color: theme.text.inverse,
      fontWeight: FONTS.weights.semibold,
    },

    // ============================================
    // TAB BAR
    // ============================================

    tabBar: {
      flexDirection: "row",
      backgroundColor: theme.background.elevated,
      borderTopWidth: 1,
      borderTopColor: theme.border.light,
      paddingBottom: Platform.OS === "ios" ? SPACING.lg : SPACING.sm,
      paddingTop: SPACING.sm,
    },

    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING.sm,
    },

    tabIcon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: SPACING.xs,
    },

    tabLabel: {
      fontSize: FONTS.xs,
      fontWeight: FONTS.weights.medium,
      color: theme.text.tertiary,
    },

    tabLabelActive: {
      color: theme.accent.primary,
    },

    // ============================================
    // SEARCH BAR
    // ============================================

    searchContainer: {
      backgroundColor: theme.background.secondary,
      borderRadius: RADIUS.full,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.base,
      minHeight: 44,
      marginBottom: SPACING.base,
    },

    searchInput: {
      flex: 1,
      fontSize: FONTS.base,
      color: theme.text.primary,
      marginLeft: SPACING.sm,
      paddingVertical: SPACING.sm,
    },

    // ============================================
    // EVENT CARDS
    // ============================================

    eventCard: {
      backgroundColor: theme.background.elevated,
      borderRadius: RADIUS.xl,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },

    eventCardImage: {
      width: "100%",
      height: 200,
      backgroundColor: theme.background.secondary,
    },

    eventCardContent: {
      padding: SPACING.base,
    },

    eventCardTitle: {
      fontSize: FONTS.lg,
      fontWeight: FONTS.weights.bold,
      color: theme.text.primary,
      marginBottom: SPACING.xs,
    },

    eventCardMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: SPACING.sm,
    },

    eventCardMetaText: {
      fontSize: FONTS.sm,
      color: theme.text.secondary,
      marginLeft: SPACING.xs,
    },

    // ============================================
    // LOADING
    // ============================================

    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: SPACING.xxl,
    },

    emptyStateTitle: {
      fontSize: FONTS.xl,
      fontWeight: FONTS.weights.semibold,
      color: theme.text.primary,
      marginBottom: SPACING.sm,
      textAlign: "center",
    },

    emptyStateText: {
      fontSize: FONTS.base,
      color: theme.text.secondary,
      textAlign: "center",
      lineHeight: FONTS.base * FONTS.lineHeights.relaxed,
    },

    // ============================================
    // ERROR STATES
    // ============================================

    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.status.error + "20",
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      borderLeftWidth: 4,
      borderLeftColor: theme.status.error,
      margin: SPACING.base,
    },

    errorText: {
      fontSize: FONTS.sm,
      color: theme.status.error,
      fontWeight: FONTS.weights.medium,
    },

    // ============================================
    // CHIPS & TAGS
    // ============================================

    chip: {
      backgroundColor: theme.background.secondary,
      borderRadius: RADIUS.full,
      paddingHorizontal: SPACING.base,
      paddingVertical: SPACING.sm,
      marginRight: SPACING.sm,
      marginBottom: SPACING.sm,
    },

    chipText: {
      fontSize: FONTS.sm,
      color: theme.text.primary,
      fontWeight: FONTS.weights.medium,
    },

    chipActive: {
      backgroundColor: theme.accent.primary,
    },

    chipActiveText: {
      color: theme.text.inverse,
    },
    // ============================================
    // PROFILE COMPONENTS
    // ============================================

    profileContainer: {
      backgroundColor: theme.background.elevated,
      borderRadius: RADIUS.lg,
      padding: SPACING.base,
      marginBottom: SPACING.base,
    },

    profileMainLayout: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.base,
    },

    profileRightSection: {
      flex: 1,
      gap: SPACING.sm,
    },

    profileTopRow: {
      flexDirection: "row",
      gap: SPACING.sm,
    },

    profileNameBox: {
      flex: 2,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
    },

    profileLocationBox: {
      flex: 1,
      backgroundColor: theme.background.secondary,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: theme.border.light,
      padding: SPACING.md,
      justifyContent: "center",
      alignItems: "center",
    },

    profileStatsRow: {
      flexDirection: "row",
      gap: SPACING.sm,
    },

    profileStatBox: {
      flex: 1,
      backgroundColor: theme.background.secondary,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: theme.border.light,
      padding: SPACING.md,
      alignItems: "center",
    },

    profileInfo: {
      fontSize: FONTS.lg,
      fontWeight: FONTS.weights.semibold,
      color: theme.text.primary,
      marginTop: SPACING.xs,
    },

    profileStatLabel: {
      fontSize: FONTS.xs,
      color: theme.text.secondary,
      marginTop: 2,
    },

    // ============================================
    // SPACING UTILITIES
    // ============================================

    mt_xs: { marginTop: SPACING.xs },
    mt_sm: { marginTop: SPACING.sm },
    mt_md: { marginTop: SPACING.md },
    mt_base: { marginTop: SPACING.base },
    mt_lg: { marginTop: SPACING.lg },
    mt_xl: { marginTop: SPACING.xl },
    mt_xxl: { marginTop: SPACING.xxl },

    mb_xs: { marginBottom: SPACING.xs },
    mb_sm: { marginBottom: SPACING.sm },
    mb_md: { marginBottom: SPACING.md },
    mb_base: { marginBottom: SPACING.base },
    mb_lg: { marginBottom: SPACING.lg },
    mb_xl: { marginBottom: SPACING.xl },
    mb_xxl: { marginBottom: SPACING.xxl },

    mx_xs: { marginHorizontal: SPACING.xs },
    mx_sm: { marginHorizontal: SPACING.sm },
    mx_md: { marginHorizontal: SPACING.md },
    mx_base: { marginHorizontal: SPACING.base },
    mx_lg: { marginHorizontal: SPACING.lg },
    mx_xl: { marginHorizontal: SPACING.xl },

    my_xs: { marginVertical: SPACING.xs },
    my_sm: { marginVertical: SPACING.sm },
    my_md: { marginVertical: SPACING.md },
    my_base: { marginVertical: SPACING.base },
    my_lg: { marginVertical: SPACING.lg },
    my_xl: { marginVertical: SPACING.xl },

    p_xs: { padding: SPACING.xs },
    p_sm: { padding: SPACING.sm },
    p_md: { padding: SPACING.md },
    p_base: { padding: SPACING.base },
    p_lg: { padding: SPACING.lg },
    p_xl: { padding: SPACING.xl },

    px_xs: { paddingHorizontal: SPACING.xs },
    px_sm: { paddingHorizontal: SPACING.sm },
    px_md: { paddingHorizontal: SPACING.md },
    px_base: { paddingHorizontal: SPACING.base },
    px_lg: { paddingHorizontal: SPACING.lg },
    px_xl: { paddingHorizontal: SPACING.xl },

    py_xs: { paddingVertical: SPACING.xs },
    py_sm: { paddingVertical: SPACING.sm },
    py_md: { paddingVertical: SPACING.md },
    py_base: { paddingVertical: SPACING.base },
    py_lg: { paddingVertical: SPACING.lg },
    py_xl: { paddingVertical: SPACING.xl },

    // ============================================
    // FLEX UTILITIES
    // ============================================

    row: { flexDirection: "row" },
    column: { flexDirection: "column" },
    alignCenter: { alignItems: "center" },
    alignStart: { alignItems: "flex-start" },
    alignEnd: { alignItems: "flex-end" },
    alignStretch: { alignItems: "stretch" },
    justifyCenter: { justifyContent: "center" },
    justifyBetween: { justifyContent: "space-between" },
    justifyAround: { justifyContent: "space-around" },
    justifyStart: { justifyContent: "flex-start" },
    justifyEnd: { justifyContent: "flex-end" },
    flex1: { flex: 1 },
    flexWrap: { flexWrap: "wrap" },
  });

// Export default light theme styles
export const styles = createStyles(LIGHT_THEME);
