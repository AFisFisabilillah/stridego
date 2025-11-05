import {StyleSheet, Text, TextInput, TextInputKeyPressEvent, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Colors} from "@/constants/theme";
import {Image} from "expo-image";
import {useImmer} from "use-immer";
import {useRef} from "react";

export default function VerificationCode(){
    const [code,setCode] = useImmer<string[]>(['','','','','','']);
    const inputs = useRef<(TextInput | null)[]>([]);

    const handleChange= (text: string, index: number) => {
        setCode(draft => {
            draft[index] = text;
            if (text && index < 5) {
                inputs.current[index + 1]?.focus();
            } else if (!text && index > 0) {
                inputs.current[index - 1]?.focus();
            }
        })

    }

    const handleKeyPress = (event:TextInputKeyPressEvent, index :number) => {
        if (event.nativeEvent.key === "Backspace" && index >0 ) {
            inputs.current[index-1]?.focus();
        }else if(code[index]){
            inputs.current[index+1]?.focus();
        }
    }

    return(
        <>
            <SafeAreaView style={style.container}>
                <View style={style.containerView}>
                    <View style={style.containerTitle}>
                        <Text style={style.textTitle}>Verifikasi Kode</Text>
                        <Text style={style.textSecond}>Masukkan 6 digit kode yang dikirim ke email kamu.</Text>
                    </View>
                    <View style={style.containerImage}>
                        <Image style={style.image} source={require("../../assets/verification-ilustration.svg")}/>
                    </View>
                    <View style={style.containerCode}>
                        {code.map((item,index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    inputs.current[index]=ref
                                }}
                                onChangeText={(text ) =>{
                                    handleChange(text, index)
                                }}
                                onKeyPress={(event)=>{
                                    handleKeyPress(event,index);
                                }}
                                value={item}
                                style={style.inputCode}
                                maxLength={1}
                                keyboardType={"number-pad"}/>
                        ))}
                    </View>
                    <View style={style.containerButton}>
                        <TouchableOpacity  activeOpacity={.8} style={style.button}>
                            <Text style={style.textSubmit}>Register</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={style.resendContainer}>
                            <Text style={style.resendText}>
                                Kirim ulang kode
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </SafeAreaView>
        </>
    )
}

const style = StyleSheet.create({
    textTitle: {
        color: Colors.light.primary,
        fontSize: 25,
        textAlign: "center",
        fontWeight: "600"
    },
    textSecond: {
        color: Colors.light.paragraph,
        fontSize: 16,
        fontWeight: "600",
        flexWrap: "wrap",
        textAlign: "center",
        marginTop: 10
    },
    image: {
        width: 230,
        height: 230,
        borderColor: 'gray',
        margin:"auto"
    },
    button:{
        marginTop:12,
        paddingVertical: 15,
        margin:"auto",
        width:"100%",
        borderRadius:40,
        backgroundColor:Colors.light.primary,

    },

    resendContainer: {
        marginTop: 14,
    },
    resendText: {
        color: Colors.light.primary,
        fontWeight: "600",
        textDecorationLine: "underline",
        textAlign:"center"
    },

    textSubmit:{
        textAlign:"center",
        fontWeight:"600",
        color:"white",
        fontSize: 18,
    },
    containerButton:{
        marginTop:24,
    },
    container: {
        height: "100%",
        width: "100%",
        backgroundColor: Colors.light.background,
    },
    containerView: {
        marginHorizontal: "auto",
        marginTop: 30
    },
    containerTitle: {
        width: "80%" ,
        marginHorizontal: "auto",
    },
    containerImage:{
        marginTop:30
    },
    containerCode:{
        flexDirection:"row",
        flexWrap:"wrap",
        justifyContent:"center",
        gap:5
    },
    inputCode:{
        width: 50,
        height: 65,
        fontSize: 22,
        color: "#dcd9d9",
        backgroundColor: "rgba(30,144,255,0.32)",
        borderWidth:1.5,
        borderColor: Colors.light.primary,
        borderRadius: 5,
        textAlign: "center",
    }
})