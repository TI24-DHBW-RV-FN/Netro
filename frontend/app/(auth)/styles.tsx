import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#ad98f5",
    },
    subtitle: {
        fontSize: 18,
        color: "#666",
        marginBottom: 30,
    },
    text: {
        fontSize: 18,
        color: "white",
    },
    button: {
        backgroundColor: "#ad98f5",
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        width: "80%",
    },
    buttonSmall: {
        backgroundColor: "#ad98f5",
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        width: "20%",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        textAlign: "center",
        fontWeight: "bold",
    },
    input: {
        backgroundColor: "#b7baba",
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        width: "80%",
    },
});
