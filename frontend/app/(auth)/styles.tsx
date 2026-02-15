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
        textAlign: "center",
    },
    subtitle: {
        fontSize: 24,
        color: "#666",
        marginBottom: 30,
        textAlign: "center",
    },
    text: {
        fontSize: 18,
        color: "#666",
        textAlign: "center",
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
// categories styles
    list: {
        paddingVertical: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        margin: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipSelected: {
        backgroundColor: '#111',
        borderColor: '#111',
    },
    chipUnselected: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
    },
    chipText: {
        fontSize: 14,
        textTransform: 'capitalize',
    },
    chipTextSelected: {
        color: '#fff',
    },
    chipTextUnselected: {
        color: '#111',
    },
});

export default authStyles;
