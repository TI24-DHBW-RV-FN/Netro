import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  useColorScheme,
  Linking,
  Animated,
  PanResponder,
} from "react-native";
import {
  Sun,
  Moon,
  ExternalLink,
  Mail,
  Lock,
  AlertCircle,
  User,
  Hash,
  MapPin,
  Search,
  Ghost,
  Plus,
  Heart,
  Check,
  Settings,
  X,
  Sparkles,
  Home,
  Calendar,
  Users,
} from "lucide-react-native";
import {
  createStyles,
  LIGHT_THEME,
  DARK_THEME,
  SPACING,
  RADIUS,
} from "./styles";

// Layout Component to showcase all design elements
export default function DesignSystemShowcase() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChips, setSelectedChips] = useState<number[]>([0]);
  const [isGhostActive, setIsGhostActive] = useState(false);
  const imageUrl = "";
  // Card
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );
  const flipAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Flip Animation
  const handleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Pan Responder Swipe
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        translateX.setValue(gestureState.dx);
        if (gestureState.dx < -120) {
          setSwipeDirection("left");
        } else if (gestureState.dx > 120) {
          setSwipeDirection("right");
        } else {
          setSwipeDirection(null);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 120) {
          // Card weganimieren
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: gestureState.dx > 0 ? 500 : -500,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            console.log(
              gestureState.dx > 0 ? "Rejected (right)" : "Accepted (left)",
            );
            // Reset für nächste Karte
            translateX.setValue(0);
            opacity.setValue(1);
            setSwipeDirection(null);
          });
        } else {
          // Zurück zur Mitte
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start(() => {
            setSwipeDirection(null);
          });
        }
      },
    }),
  ).current;

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  const backgroundColor = translateX.interpolate({
    inputRange: [-350, -120, 0, 120, 350],
    outputRange: [
      "rgba(16, 185, 129, 0.8)",
      "rgba(16, 185, 129, 0.3)",
      "transparent",
      "rgba(239, 68, 68, 0.3)",
      "rgba(239, 68, 68, 0.8)",
    ],
    extrapolate: "clamp",
  });

  // Get theme based on mode
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;
  const styles = createStyles(theme);

  const toggleChip = (index: number) => {
    setSelectedChips((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.card}>
            {/* Theme Toggle */}
            <Pressable
              style={({ pressed }) => [
                styles.themeToggleContainer,
                pressed && styles.themeTogglePressed,
              ]}
              onPress={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? (
                <Moon size={24} color={theme.text.primary} />
              ) : (
                <Sun size={24} color={theme.text.primary} />
              )}
            </Pressable>
          </View>

          {/* Text */}
          <>
            <View style={styles.card}>
              <Text style={[styles.gradientText, styles.mb_sm]}>
                Color Gradient
              </Text>
              <Text style={[styles.h1, styles.mb_sm]}>Heading 1 - Display</Text>
              <Text style={[styles.h2, styles.mb_sm]}>
                Heading 2 - Page Title
              </Text>
              <Text style={[styles.h3, styles.mb_sm]}>Heading 3 - Section</Text>
              <Text style={[styles.h4, styles.mb_base]}>
                Heading 4 - Subsection
              </Text>

              <Text style={[styles.bodyLarge, styles.mb_sm]}>
                Large body text - Perfect for introductions and important
                content that needs emphasis.
              </Text>

              <Text style={[styles.body, styles.mb_sm]}>
                Regular body text - The standard text size for most content.
                Easy to read with optimal line spacing.
              </Text>

              <Text style={[styles.bodySecondary, styles.mb_sm]}>
                Secondary body text - Used for supporting information and less
                critical details.
              </Text>

              <Text style={[styles.caption, styles.mb_sm]}>
                Caption text - Perfect for metadata, timestamps, and small
                labels
              </Text>

              <Text style={[styles.captionBold, styles.mb_sm]}>
                Caption bold - Emphasized small text
              </Text>

              <Text style={[styles.label, styles.mb_sm]}>Input Label</Text>

              <Pressable
                onPress={() => Linking.openURL("https://example.com")}
                style={styles.linkContainer}
              >
                {({ pressed }) => (
                  <>
                    <Text style={[styles.link, pressed && styles.linkPressed]}>
                      This is a clickable link
                    </Text>
                    <ExternalLink
                      size={16}
                      color={
                        pressed ? theme.accent.secondary : theme.accent.primary
                      }
                    />
                  </>
                )}
              </Pressable>
            </View>
          </>

          {/* Input Fields Section */}
          <>
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <View style={styles.inputWrapper}>
                  <Mail
                    size={20}
                    color={theme.text.tertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="you@example.com"
                    placeholderTextColor={theme.text.tertiary}
                    value={inputValue}
                    onChangeText={setInputValue}
                    keyboardAppearance={isDarkMode ? "dark" : "light"}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <Lock
                    size={20}
                    color={theme.text.tertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.text.tertiary}
                    secureTextEntry
                    keyboardAppearance={isDarkMode ? "dark" : "light"}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ERROR STATE</Text>
                <View style={styles.inputWrapper}>
                  <AlertCircle
                    size={20}
                    color={theme.status.error}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputWithIcon, styles.inputError]}
                    placeholder="Invalid input"
                    placeholderTextColor={theme.text.tertiary}
                    keyboardAppearance={isDarkMode ? "dark" : "light"}
                  />
                </View>
                <Text style={styles.inputErrorText}>
                  This field is required
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>BIO</Text>
                <View style={styles.inputWrapper}>
                  <User
                    size={20}
                    color={theme.text.tertiary}
                    style={styles.inputIconTextArea}
                  />
                  <TextInput
                    style={styles.textAreaWithIcon}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor={theme.text.tertiary}
                    multiline
                    numberOfLines={4}
                    keyboardAppearance={isDarkMode ? "dark" : "light"}
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>EMAIL TOKEN</Text>
                <View style={styles.inputWrapper}>
                  <Hash
                    size={20}
                    color={theme.text.tertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="Enter verification token"
                    placeholderTextColor={theme.text.tertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    keyboardAppearance={isDarkMode ? "dark" : "light"}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>USERNAME</Text>
                <View style={styles.inputWrapper}>
                  <User
                    size={20}
                    color={theme.text.tertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="johndoe"
                    placeholderTextColor={theme.text.tertiary}
                    autoCapitalize="none"
                    keyboardAppearance={isDarkMode ? "dark" : "light"}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>CURRENT LOCATION</Text>
                <View style={styles.inputWrapper}>
                  <MapPin
                    size={20}
                    color={theme.text.tertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="Berlin, Germany"
                    placeholderTextColor={theme.text.tertiary}
                    keyboardAppearance={isDarkMode ? "dark" : "light"}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.inputButton,
                      pressed && styles.inputButtonPressed,
                    ]}
                    onPress={() => console.log("Search location")}
                  >
                    {({ pressed }) => (
                      <Search
                        size={20}
                        color={
                          pressed
                            ? theme.accent.secondary
                            : theme.accent.primary
                        }
                      />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </>
          {/* Buttons Section */}
          <>
            <View style={styles.card}>
              <TouchableOpacity style={[styles.button, styles.mb_md]}>
                <Text style={styles.buttonText}>Primary Button</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.buttonSecondary, styles.mb_md]}>
                <Text style={styles.buttonSecondaryText}>Secondary Button</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.buttonGhost, styles.mb_md]}
                onPress={() => setIsGhostActive(!isGhostActive)}
              >
                <Ghost
                  size={24}
                  color={
                    isGhostActive ? theme.accent.primary : theme.text.secondary
                  }
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonDisabled, styles.mb_xl]}
                disabled
              >
                <Text style={styles.buttonText}>Disabled Button</Text>
              </TouchableOpacity>

              <View style={[styles.row, styles.mb_md]}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSmall, { flex: 0.48 }]}
                >
                  <Text style={styles.buttonText}>Small</Text>
                </TouchableOpacity>
                <View style={{ width: SPACING.sm }} />
                <TouchableOpacity
                  style={[
                    styles.buttonSecondary,
                    styles.buttonSmall,
                    { flex: 0.48 },
                  ]}
                >
                  <Text style={styles.buttonSecondaryText}>Small</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.buttonLarge, styles.mb_xl]}
              >
                <Text style={styles.buttonText}>Large Button</Text>
              </TouchableOpacity>

              <View style={[styles.row, styles.justifyAround]}>
                <TouchableOpacity style={styles.iconButton}>
                  <Plus size={20} color={theme.text.primary} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Heart size={20} color={theme.text.primary} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButtonPrimary}>
                  <Check size={20} color={theme.text.inverse} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Settings
                    size={20}
                    color={theme.text.primary}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButtonSecondary}>
                  <X size={20} color={theme.text.inverse} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Sparkles
                    size={20}
                    color={theme.text.primary}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>

          {/* List Items Section */}
          <>
            <View style={styles.mb_xxl}></View>

            <TouchableOpacity
              style={styles.listItem}
              onPress={() => console.log("")}
              activeOpacity={0.7}
            >
              <View style={styles.listItemIcon}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ width: 24, height: 24, borderRadius: 12 }}
                  />
                ) : (
                  <User
                    size={24}
                    color={theme.accent.primary}
                    strokeWidth={2}
                  />
                )}
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Sarah Johnson</Text>
                <Text style={styles.listItemSubtitle}>
                  Product Designer at Tech Co
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.listItem}
              onPress={() => console.log("")}
              activeOpacity={0.7}
            >
              <View style={styles.listItemIcon}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ width: 24, height: 24, borderRadius: 12 }}
                  />
                ) : (
                  <Hash
                    size={24}
                    color={theme.accent.primary}
                    strokeWidth={2}
                  />
                )}
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Design Workshop 2024</Text>
                <Text style={styles.listItemSubtitle}>
                  Tomorrow at 6:00 PM • Berlin
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.listItem}
              onPress={() => console.log("")}
              activeOpacity={0.7}
            >
              <View style={styles.listItemIcon}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ width: 24, height: 24, borderRadius: 12 }}
                  />
                ) : (
                  <Sparkles
                    size={24}
                    color={theme.accent.secondary}
                    strokeWidth={2}
                  />
                )}
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Creative Meetup</Text>
                <Text style={styles.listItemSubtitle}>
                  Next week • 15 attending
                </Text>
              </View>
            </TouchableOpacity>
          </>

          {/* List Items Section Scrollable*/}
          <>
            <View style={styles.cardScrollable}>
              <Text style={styles.h3}>Scrollable List</Text>
              <ScrollView
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator={true}
              >
                <TouchableOpacity
                  style={styles.listItemScrollable}
                  onPress={() => console.log("Sarah Johnson clicked")}
                  activeOpacity={0.7}
                >
                  <View style={styles.listItemIcon}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: 24, height: 24, borderRadius: 12 }}
                      />
                    ) : (
                      <User
                        size={24}
                        color={theme.accent.primary}
                        strokeWidth={2}
                      />
                    )}
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Sarah Johnson</Text>
                    <Text style={styles.listItemSubtitle}>
                      Product Designer at Tech Co
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.listItemScrollable}
                  onPress={() => console.log("Sarah Johnson clicked")}
                  activeOpacity={0.7}
                >
                  <View style={styles.listItemIcon}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: 24, height: 24, borderRadius: 12 }}
                      />
                    ) : (
                      <User
                        size={24}
                        color={theme.accent.primary}
                        strokeWidth={2}
                      />
                    )}
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Sarah Johnson</Text>
                    <Text style={styles.listItemSubtitle}>
                      Product Designer at Tech Co
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.listItemScrollable}
                  onPress={() => console.log("Sarah Johnson clicked")}
                  activeOpacity={0.7}
                >
                  <View style={styles.listItemIcon}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: 24, height: 24, borderRadius: 12 }}
                      />
                    ) : (
                      <User
                        size={24}
                        color={theme.accent.primary}
                        strokeWidth={2}
                      />
                    )}
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Sarah Johnson</Text>
                    <Text style={styles.listItemSubtitle}>
                      Product Designer at Tech Co
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.listItemScrollable}
                  onPress={() => console.log("Sarah Johnson clicked")}
                  activeOpacity={0.7}
                >
                  <View style={styles.listItemIcon}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: 24, height: 24, borderRadius: 12 }}
                      />
                    ) : (
                      <User
                        size={24}
                        color={theme.accent.primary}
                        strokeWidth={2}
                      />
                    )}
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Sarah Johnson</Text>
                    <Text style={styles.listItemSubtitle}>
                      Product Designer at Tech Co
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.listItemScrollable}
                  onPress={() => console.log("Sarah Johnson clicked")}
                  activeOpacity={0.7}
                >
                  <View style={styles.listItemIcon}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: 24, height: 24, borderRadius: 12 }}
                      />
                    ) : (
                      <User
                        size={24}
                        color={theme.accent.primary}
                        strokeWidth={2}
                      />
                    )}
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>Sarah Johnson</Text>
                    <Text style={styles.listItemSubtitle}>
                      Product Designer at Tech Co
                    </Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </>

          {/* Avatars Section */}
          <>
            <View style={styles.card}>
              <View style={styles.avatar} />

              <TouchableOpacity
                style={styles.avatar}
                onPress={() => console.log("")}
                activeOpacity={0.7}
              >
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ width: 80, height: 80, borderRadius: RADIUS.full }}
                  />
                ) : (
                  <User
                    size={40}
                    color={theme.accent.primary}
                    strokeWidth={2}
                  />
                )}
              </TouchableOpacity>
            </View>
          </>

          {/* Badges & Indicators Section */}
          <>
            <View style={styles.card}>
              <View
                style={[
                  styles.row,
                  styles.alignCenter,
                  styles.flexWrap,
                  styles.mb_lg,
                ]}
              >
                <View style={[styles.badge, styles.mx_xs, styles.my_xs]}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
                <View style={[styles.badge, styles.mx_xs, styles.my_xs]}>
                  <Text style={styles.badgeText}>NEW</Text>
                </View>
                <View style={[styles.badge, styles.mx_xs, styles.my_xs]}>
                  <Text style={styles.badgeText}>99+</Text>
                </View>
              </View>
            </View>
          </>

          {/* Chips & Tags Section */}
          <>
            <View style={styles.card}>
              <View style={[styles.row, styles.flexWrap]}>
                {["Design", "Tech", "Music", "Sports", "Food", "Art"].map(
                  (label, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.chip,
                        selectedChips.includes(index) && styles.chipActive,
                      ]}
                      onPress={() => toggleChip(index)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedChips.includes(index) &&
                            styles.chipActiveText,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>

            <View style={styles.card}>
              <View style={[styles.row, styles.flexWrap]}>
                {[
                  { label: "Design", icon: Sparkles },
                  { label: "Tech", icon: Hash },
                  { label: "Music", icon: Heart },
                  { label: "Sports", icon: MapPin },
                  { label: "Food", icon: Plus },
                  { label: "Art", icon: User },
                ].map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = selectedChips.includes(index);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => toggleChip(index)}
                    >
                      <IconComponent
                        size={16}
                        color={
                          isActive ? theme.text.inverse : theme.text.secondary
                        }
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          isActive && styles.chipActiveText,
                          { marginLeft: 6 },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>

          {/* Search Bar Section */}
          <>
            <View style={[styles.mt_base, styles.mx_base]}>
              <View style={styles.searchContainer}>
                <Search size={20} color={theme.text.tertiary} strokeWidth={2} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search events, people..."
                  placeholderTextColor={theme.text.tertiary}
                  keyboardAppearance={isDarkMode ? "dark" : "light"}
                />
              </View>
            </View>
          </>

          {/* Event Card Section */}
          <>
            <View style={[styles.alignCenter, styles.justifyCenter]}>
              <Animated.View
                {...panResponder.panHandlers}
                style={{
                  transform: [{ translateX }],
                  width: 350,
                  height: 500,
                  opacity: opacity,
                }}
              >
                <TouchableOpacity activeOpacity={1} onPress={handleFlip}>
                  {/* Colored Overlay */}
                  <Animated.View
                    style={{
                      position: "absolute",
                      width: 350,
                      height: 500,
                      backgroundColor: backgroundColor,
                      borderRadius: RADIUS.xl,
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  />

                  {swipeDirection && (
                    <View
                      style={{
                        position: "absolute",
                        top: SPACING.xl,
                        alignSelf: "center",
                        zIndex: 2,
                        pointerEvents: "none",
                      }}
                    >
                      {swipeDirection === "left" ? (
                        <Check
                          size={48}
                          color={theme.status.success}
                          strokeWidth={3}
                        />
                      ) : (
                        <X
                          size={48}
                          color={theme.status.error}
                          strokeWidth={3}
                        />
                      )}
                    </View>
                  )}

                  {/* Front Side */}
                  <Animated.View
                    style={[
                      styles.eventCard,
                      {
                        position: "absolute",
                        width: 350,
                        height: 500,
                        backfaceVisibility: "hidden",
                        transform: [{ rotateY: frontInterpolate }],
                        opacity: frontOpacity,
                      },
                    ]}
                  >
                    <View style={styles.eventCardImage}>
                      {imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          style={{ width: "100%", height: 200 }}
                        />
                      ) : (
                        <View
                          style={[
                            styles.flex1,
                            styles.justifyCenter,
                            styles.alignCenter,
                          ]}
                        >
                          <Sparkles
                            size={48}
                            color={theme.accent.primary}
                            strokeWidth={2}
                          />
                        </View>
                      )}
                    </View>
                    <View style={styles.eventCardContent}>
                      <View style={[styles.row, styles.flexWrap, styles.mb_sm]}>
                        <View style={styles.chip}>
                          <Text style={styles.chipText}>Design</Text>
                        </View>
                        <View style={styles.chip}>
                          <Text style={styles.chipText}>Workshop</Text>
                        </View>
                      </View>
                      <Text style={styles.eventCardTitle}>
                        Creative Design Workshop
                      </Text>
                      <Text style={[styles.bodySecondary, styles.mb_md]}>
                        Join us for an inspiring evening of creativity and
                        design thinking.
                      </Text>
                      <View style={styles.eventCardMeta}>
                        <MapPin
                          size={16}
                          color={theme.text.secondary}
                          strokeWidth={2}
                        />
                        <Text style={styles.eventCardMetaText}>
                          Berlin, Germany
                        </Text>
                      </View>
                      <View style={styles.eventCardMeta}>
                        <Calendar
                          size={16}
                          color={theme.text.secondary}
                          strokeWidth={2}
                        />
                        <Text style={styles.eventCardMetaText}>
                          Tomorrow, 6:00 PM
                        </Text>
                      </View>
                      <View style={styles.eventCardMeta}>
                        <Users
                          size={16}
                          color={theme.text.secondary}
                          strokeWidth={2}
                        />
                        <Text style={styles.eventCardMetaText}>
                          24 people interested
                        </Text>
                      </View>
                    </View>
                  </Animated.View>

                  {/* Back Side */}
                  <Animated.View
                    style={[
                      styles.eventCard,
                      {
                        position: "absolute",
                        width: 350,
                        height: 500,
                        backfaceVisibility: "hidden",
                        transform: [{ rotateY: backInterpolate }],
                        opacity: backOpacity,
                      },
                    ]}
                  >
                    <View
                      style={[styles.eventCardContent, { padding: SPACING.lg }]}
                    >
                      <Text style={styles.eventCardTitle}>Event Details</Text>
                      <Text
                        style={[
                          styles.bodySecondary,
                          { marginTop: SPACING.md },
                        ]}
                      >
                        Additional information about the event goes here.
                      </Text>
                      <Text
                        style={[
                          styles.bodySecondary,
                          { marginTop: SPACING.md },
                        ]}
                      >
                        Organizer: Design Studio Berlin
                      </Text>
                      <Text
                        style={[
                          styles.bodySecondary,
                          { marginTop: SPACING.sm },
                        ]}
                      >
                        Price: Free
                      </Text>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </>

          {/* Tab Bar Section */}
          <>
            <View style={styles.card}>
              <View style={styles.tabBar}>
                {[
                  { label: "Feed", icon: Home },
                  { label: "Events", icon: Calendar },
                  { label: "Add", icon: Plus },
                  { label: "Search", icon: Search },
                  { label: "Profile", icon: User },
                ].map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === index;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.tab}
                      onPress={() => setActiveTab(index)}
                    >
                      <View
                        style={[
                          styles.tabIcon,
                          isActive && {
                            backgroundColor: theme.accent.primary + "20",
                            transform: [{ scale: 1.1 }],
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            alignItems: "center",
                            justifyContent: "center",
                          },
                        ]}
                      >
                        <IconComponent
                          size={isActive ? 26 : 24}
                          color={
                            isActive
                              ? theme.accent.primary
                              : theme.text.secondary
                          }
                          strokeWidth={2}
                        />
                      </View>
                      <Text
                        style={[
                          styles.tabLabel,
                          isActive && styles.tabLabelActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>

          {/* Loading States Section */}
          <>
            <View style={[styles.card, styles.alignCenter, styles.py_xl]}>
              <ActivityIndicator size="large" color={theme.accent.primary} />
              <Text style={[styles.body, styles.mt_base]}>
                Loading your events...
              </Text>
            </View>
          </>

          {/* Empty State Section */}
          <>
            <View style={[styles.card, styles.emptyStateContainer]}>
              <Calendar
                size={64}
                color={theme.text.tertiary}
                strokeWidth={1.5}
              />
              <Text style={styles.emptyStateTitle}>No Events Yet</Text>
              <Text style={styles.emptyStateText}>
                Looks like there are no upcoming events. Start exploring to find
                exciting activities near you.
              </Text>
              <TouchableOpacity style={[styles.button, styles.mt_lg]}>
                <Text style={styles.buttonText}>Explore Events</Text>
              </TouchableOpacity>
            </View>
          </>

          {/* Error State Section */}
          <>
            <View style={styles.errorContainer}>
              <AlertCircle
                size={24}
                color={theme.status.error}
                strokeWidth={2}
              />
              <Text style={styles.errorText}>
                Unable to load content. Please check your connection and try
                again.
              </Text>
            </View>
          </>
          {/* Spacing demonstration */}
          <>
            <View style={styles.card}>
              <Text style={[styles.caption, styles.mb_xs]}>
                Extra Small (2px)
              </Text>
              <Text style={[styles.caption, styles.mb_sm]}>Small (8px)</Text>
              <Text style={[styles.caption, styles.mb_md]}>Medium (12px)</Text>
              <Text style={[styles.caption, styles.mb_base]}>Base (16px)</Text>
              <Text style={[styles.caption, styles.mb_lg]}>Large (20px)</Text>
              <Text style={[styles.caption, styles.mb_xl]}>
                Extra Large (24px)
              </Text>
              <Text style={styles.caption}>Double Extra Large (32px)</Text>
            </View>
          </>

          {/* Profile Component */}
          <>
            <View style={styles.card}>
              {/* Profile Main Layout */}
              <View style={styles.profileMainLayout}>
                {/* Avatar Circle - Left Side */}
                <TouchableOpacity>
                  <View style={styles.avatar}>
                    <User
                      size={48}
                      color={theme.text.secondary}
                      strokeWidth={1.5}
                    />
                  </View>
                </TouchableOpacity>

                {/* Right Section */}
                <View style={styles.profileRightSection}>
                  {/* Name and Location Row */}
                  <View style={styles.profileTopRow}>
                    {/* Name Box */}
                    <View style={styles.profileNameBox}>
                      <Text style={styles.gradientText}>John Doe</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.buttonGhost, styles.mb_md]}
                      onPress={() => setIsGhostActive(!isGhostActive)}
                    >
                      <Ghost
                        size={24}
                        color={
                          isGhostActive
                            ? theme.accent.primary
                            : theme.text.secondary
                        }
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Stats Row - Friends, Events, Mode */}
                  <View style={styles.profileStatsRow}>
                    {/* Friends Box */}
                    <TouchableOpacity style={styles.profileStatBox}>
                      <Users
                        size={24}
                        color={theme.accent.primary}
                        strokeWidth={2}
                      />
                      <Text style={styles.profileInfo}>156</Text>
                      <Text style={styles.profileStatLabel}>Friends</Text>
                    </TouchableOpacity>

                    {/* Events Box */}
                    <TouchableOpacity style={styles.profileStatBox}>
                      <Calendar
                        size={24}
                        color={theme.accent.primary}
                        strokeWidth={2}
                      />
                      <Text style={styles.profileInfo}>12</Text>
                      <Text style={styles.profileStatLabel}>Events</Text>
                    </TouchableOpacity>

                    {/* Location Box */}
                    <TouchableOpacity style={styles.profileLocationBox}>
                      <MapPin
                        size={24}
                        color={theme.accent.primary}
                        strokeWidth={2}
                      />
                      <Text style={styles.profileInfo}>Berlin, Germany</Text>
                      <Text style={styles.profileStatLabel}>BLocation</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
