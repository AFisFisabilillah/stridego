import {Pressable, StyleSheet, Text, View} from "react-native";
import {Colors} from "@/constants/theme";

export function ButtonOutline({color, handlePress, style,text}: { color: string, handlePress: () => void ,style?:object, text:string}) {
    return (
        <>

            <Pressable onPress={handlePress}>
                {({pressed}) => (
                    <View
                        style={[
                            styles.button,
                            styles.buttonRegister,
                            pressed && {backgroundColor:color},
                            style,
                            color && {borderColor: color}
                        ]}
                    >
                        <Text
                            style={[
                                styles.textRegister,
                                {color:color},
                                pressed && {color: "#FFFFFF"},
                            ]}
                        >
                            {text}
                        </Text>
                    </View>
                )}
            </Pressable>

        </>
    )
}

const styles = StyleSheet.create({
    textRegister: {
        fontSize: 16,
        color: Colors.light.primary,
        textAlign: "center",
        fontWeight:"600"
    },
    button: {
        marginTop: 12,
        paddingVertical: 14,
        margin: "auto",
        width: "100%",
        borderRadius: 40
    },
    buttonRegister: {
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
})