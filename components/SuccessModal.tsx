import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SuccessModal({ visible, onClose }:{visible:boolean, onClose:() => void}) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.card}>

                    <View style={styles.iconWrapper}>
                        <Ionicons name="checkmark-circle" size={70} color="#4CAF50" />
                    </View>

                    <Text style={styles.title}>Berhasil!</Text>
                    <Text style={styles.message}>
                        Data berhasil dikirim.
                    </Text>

                    {/* Button */}
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    card: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: "center",
        elevation: 5
    },
    iconWrapper: {
        marginBottom: 15
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5
    },
    message: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 25
    },
    button: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 10
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    }
});
