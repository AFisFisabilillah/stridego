import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FriendRecommendCard({ name, mutual, avatar, onAdd }) {
    return (
        <View style={styles.card}>
            <Image source={{ uri: avatar }} style={styles.avatar} />

            <Text style={styles.name} numberOfLines={1}>
                {name}
            </Text>
            <Text style={styles.mutual}>{mutual} mutual</Text>

            <TouchableOpacity style={styles.button} onPress={onAdd}>
                <Ionicons name="person-add" size={16} color="#fff" />
                <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 150,             // card kecil
        backgroundColor: "#fff",
        paddingVertical: 16,
        paddingHorizontal: 10,
        borderRadius: 14,
        alignItems: "center",
        elevation: 4,
        margin: 8
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 40,
        marginBottom: 10
    },
    name: {
        fontSize: 15,
        fontWeight: "600",
        color: "#222",
        marginBottom: 2,
        textAlign: "center"
    },
    mutual: {
        fontSize: 12,
        color: "#777",
        marginBottom: 12
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4A90E2",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13
    }
});
