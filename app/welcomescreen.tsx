import {SafeAreaView} from "react-native-safe-area-context";
import {StyleSheet, View, Text, Pressable} from "react-native";
import {Image} from "expo-image";
import {Colors} from "@/constants/theme";
import {Link} from "expo-router";

export default function Welcome() {


    return (
        <>
            <SafeAreaView style={style.container}>
                <View style={style.containerView}>
                    <View style={style.containerImage}>
                        <Image style={style.image} source={require("../assets/run-ilustration.svg")}/>
                    </View>
                    <View style={style.containerTitle}>
                        <Text style={style.textTittle}>Selamat Datang Di StrideGo</Text>
                    </View>
                    <View style={style.containerParagraph}>
                        <Text style={style.textParagraph}>Aya awali langkahmu menuju tujuan bersama Stridego</Text>
                    </View>
                </View>
                <View style={style.containerButton}>
                    <Link href="/" asChild>
                        <Pressable >
                            {({ pressed }) => (
                                <View
                                    style={[
                                        style.button,
                                        style.buttonLogin,
                                        pressed && { backgroundColor: "#086acc" },
                                    ]}
                                >
                                    <Text style={style.textLogin}>Login</Text>
                                </View>
                            )}
                        </Pressable>
                    </Link>

                    <Link href="/(auth)/register" asChild>
                        <Pressable>
                            {({ pressed }) => (
                                <View
                                    style={[
                                        style.button,
                                        style.buttonRegister,
                                        pressed && { backgroundColor: Colors.light.primary },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            style.textRegister,
                                            pressed && { color: "#FFFFFF" },
                                        ]}
                                    >
                                        Register
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    </Link>
                </View>


            </SafeAreaView>
        </>
    )
}

const style = StyleSheet.create({
    image: {
        width: 280,
        height: 280,
        borderColor: 'gray'
    },
    containerView:{
        marginHorizontal: "auto",
    },
    textTittle:{
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.light.text,
        textAlign: "center"
    },
    textLogin:{
        fontSize: 16,
        color:"#FFFFFF",
        textAlign: "center"
    },
    textRegister:{
        fontSize: 16,
        color:Colors.light.primary,
        textAlign: "center"
    },
    textParagraph:{
        textAlign: "center",
        fontSize:18,
        fontWeight: "medium",
    },
    button:{
        marginTop:12,
        paddingVertical: 14,
        margin:"auto",
        width:"85%",
        borderRadius:40
    },
    buttonLogin:{
        backgroundColor:Colors.light.primary,
    },

    buttonRegister:{
        borderWidth:2,
        borderColor:Colors.light.primary,

    },
    container: {
        minHeight: "100%",
        minWidth: "100%",
        backgroundColor: Colors.light.background,
    },
    containerImage:{
        marginTop:40
    },
    containerTitle:{
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        width:230,
        marginHorizontal:"auto",
        marginTop:30
    },
    containerParagraph:{
        width:"82%",
        marginTop:25,
    },
    containerButton:{
        marginTop:50
    }


})