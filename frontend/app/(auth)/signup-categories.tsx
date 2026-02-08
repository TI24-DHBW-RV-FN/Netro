import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Pressable } from "react-native";
import { router } from "expo-router";

import { authStyles } from "./styles";
import { useSignup } from "./_layout";
import { getCategoriesApi } from "../../features/auth/api";

const MIN_SELECTION = 1;
const MAX_SELECTION = 5;

type CategoryChipProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
};

const CategoryChip: React.FC<CategoryChipProps> = ({
                                                       label,
                                                       selected,
                                                       onPress,
                                                   }) => {
    return (
        <Pressable
            onPress={onPress}
            style={[
                authStyles.chip,
                selected ? authStyles.chipSelected : authStyles.chipUnselected,
            ]}
        >
            <Text
                style={[
                    authStyles.chipText,
                    selected ? authStyles.chipTextSelected : authStyles.chipTextUnselected,
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
};

export default function SignupCategoriesScreen() {
    const { updateCategories } = useSignup();

    // categories coming from backend
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // what the user selects
    const [selected, setSelected] = useState<string[]>([]);

    // fetch categories on mount
    useEffect(() => {
        const load = async () => {
            try {
                const res = await getCategoriesApi();
                setAvailableCategories(res.categories.map((c) => c.name));
            } catch (e) {
                console.log("Failed to load categories", e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const toggleCategory = (category: string) => {
        setSelected((prev) => {
            if (prev.includes(category)) {
                return prev.filter((c) => c !== category);
            }
            if (prev.length >= MAX_SELECTION) {
                return prev;
            }
            return [...prev, category];
        });
    };

    const canContinue = selected.length >= MIN_SELECTION;

    const handleContinue = () => {
        // store into global signup state
        updateCategories(selected);

        // go to next signup step
        router.push("/(auth)/signup-confirm"); // change to your route
    };

    if (loading) {
        return (
            <View style={authStyles.container}>
                <Text>Loading categories...</Text>
            </View>
        );
    }

    return (
        <View style={authStyles.container}>
            <TouchableOpacity style={authStyles.button} onPress={() => router.back()}>
                <Text style={authStyles.buttonText}>Go Back</Text>
            </TouchableOpacity>

            <Text style={authStyles.title}>Sign Up</Text>

            <Text style={authStyles.subtitle}>What are you into?</Text>
            <Text style={authStyles.text}>
                Pick {MIN_SELECTION} to {MAX_SELECTION} categories
            </Text>

            <FlatList
                data={availableCategories}
                keyExtractor={(item) => item}
                numColumns={3}
                contentContainerStyle={authStyles.list}
                renderItem={({ item }) => (
                    <CategoryChip
                        label={item}
                        selected={selected.includes(item)}
                        onPress={() => toggleCategory(item)}
                    />
                )}
            />

            <Text style={authStyles.text}>
                {selected.length} / {MAX_SELECTION} selected
            </Text>

            <TouchableOpacity
                style={[
                    authStyles.button,
                    !canContinue && { opacity: 0.5 },
                ]}
                disabled={!canContinue}
                onPress={handleContinue}
            >
                <Text style={authStyles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}
