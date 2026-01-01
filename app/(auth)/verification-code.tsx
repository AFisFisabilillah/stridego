import {StyleSheet, Text, TextInput, TextInputKeyPressEvent, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Colors} from "@/constants/theme";
import {Image} from "expo-image";
import {useImmer} from "use-immer";
import {useEffect, useRef, useState} from "react";
import {supabase} from "@/lib/supabase";
import {useLocalSearchParams} from "expo-router/build/hooks";
import {useRouter} from "expo-router";
import {red} from "react-native-reanimated/lib/typescript/Colors";
import {data} from "browserslist";

export default function VerificationCode(){
    const [code,setCode] = useImmer<string[]>(['','','','','','']);
    const inputs = useRef<(TextInput | null)[]>([]);
    const {email} = useLocalSearchParams<{email:string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();
    const [timer, setTimer] = useState<number>(0);
    const router = useRouter();
    console.log(email)

    useEffect(() => {
        let interval: number;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    async function handleResendEmail(){
        if (timer > 0) return;
        if (!email) {
            setError("Email tidak ditemukan.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resend({
            email: email,
            type: "signup",
        });

        setLoading(false);

        if (error) {
            console.log(error.message);
            setError(error.message);
            return;
        }

        setError("");
        setTimer(180);
    }

    const handleChange= (text: string, index: number) => {
        setError("");
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

    const handleSubmit = async ()=>{
        const otp :string = code.join("");
        if(otp.length !== 6){
            setError("Masukan kode otp anda");
            return;
        }
        setLoading(true);
        supabase.auth.verifyOtp({
            email : email,
            token: code.join(""),
            type:"signup"
        }).then(value => {
            if(value.error){
                console.log(value.error.message)
                setError(value.error.message)
                return ;
            }
            console.log(value.data);
            setLoading(false);
            // router.replace({
            //     pathname:"/(auth)/input-profile",
            //     params:{
            //
            //     }
            // })
        })
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
                                style={[style.inputCode,error && style.inputError]}
                                maxLength={1}
                                keyboardType={"number-pad"}/>
                        ))}
                    </View>
                    <View style={style.containerError}>
                        {error && <Text style={style.errorTeks}>{error}</Text>}
                    </View>
                    <View style={style.containerButton}>
                        <TouchableOpacity onPress={handleSubmit} activeOpacity={.8} style={style.button}>
                            <Text style={style.textSubmit}>Register</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={timer > 0 ? 1 : 0.7}
                            onPress={handleResendEmail}
                            disabled={timer > 0}
                            style={style.resendContainer}
                        >
                            <Text
                                style={[
                                    style.resendText,
                                    { opacity: timer > 0 ? 0.5 : 1 },
                                ]}
                            >
                                {timer > 0
                                    ? `Kirim ulang dalam ${timer}s`
                                    : "Kirim ulang kode"}
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
        paddingVertical: 15,
        margin:"auto",
        width:"100%",
        borderRadius:40,
        backgroundColor:Colors.light.primary,

    },
    errorTeks:{
        color:Colors.light.error,
        textAlign:"center",
    },
    inputError:{
        borderColor:Colors.light.error,
        backgroundColor:"rgba(209,9,37,0.13)",
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
        marginTop:0,
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
        color: "#050505",
        backgroundColor: "rgba(30,144,255,0.32)",
        borderWidth:1.5,
        borderColor: Colors.light.primary,
        borderRadius: 5,
        textAlign: "center",
    },

    containerError:{
        marginVertical:10,
        minHeight:20,
        alignItems:"center",
    }
})