import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Colors} from "@/constants/theme";

type ButtonProps = {
    color : string,
    handlePress : () => void,
    style?: object,
    label : string,
}

export default function Button({color, handlePress, style, label}:ButtonProps){
     return (
         <>
             <TouchableOpacity
                 onPress={handlePress}
                 style={[
                     styles.button,
                     style,
                     {backgroundColor : color}
                 ]}
             >
                 <Text style={styles.textLogin}>{label}</Text>
             </TouchableOpacity>
         </>
     )
}

const styles = StyleSheet.create({
    textLogin:{
        fontSize: 16,
        color:"#FFFFFF",
        textAlign: "center"
    },
    button:{
        marginTop:12,
        paddingVertical: 14,
        margin:"auto",
        width:"100%",
        borderRadius:40
    },

})

