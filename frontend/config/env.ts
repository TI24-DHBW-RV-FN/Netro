const readEnv = (key: string, fallback = "") => {
    const value = process.env[key];
    if (value == null || value === "") {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.warn(`[env] Missing ${key}, using fallback.`);
        }
        return fallback;
    }
    return value;
};

export const env = {
    apiUrl: readEnv("EXPO_PUBLIC_API_URL", "http://localhost:3000"),
    type: readEnv("EXPO_PUBLIC_TYPE", "dev"),
};