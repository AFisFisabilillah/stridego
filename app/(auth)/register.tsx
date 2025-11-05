import {SafeAreaView} from "react-native-safe-area-context";
import {Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {Colors} from "@/constants/theme";
import {Image} from "expo-image";
import {} from "@expo/vector-icons/FontAwesome";
import {Fontisto} from "@expo/vector-icons";

export default function Register() {

    return (
        <>
            <SafeAreaView style={style.container}>
                <View style={style.containerView}>
                    <View style={style.containerTitle}>
                        <Text style={style.textTitle}>Create Account</Text>
                        <Text style={style.textSecond}>Mulai perjalanan lari terbaikmu sekarang.</Text>
                    </View>
                    <View style={style.containerInput}>
                        <View style={style.inputWrapper}>
                            <Fontisto
                                style={style.iconEmail}
                                name={"email"}
                                color={Colors.light.primary}
                                size={22}
                            />
                            <TextInput
                                style={style.textInput}
                                placeholderTextColor={Colors.light.paragraph} // Placeholder color should be slightly muted
                                inputMode={"email"}
                                keyboardType={"email-address"}
                                textContentType={"emailAddress"}
                                placeholder={"Email Address"}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                    <View style={style.containerButton}>
                        <TouchableOpacity activeOpacity={.8} style={[style.button,style.buttonLogin]}>
                            <Text style={style.textRegister}>Register</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={style.containerLine}>
                        <View style={style.line}></View>
                        <Text style={style.textLine}>Or</Text>
                        <View style={style.line}></View>
                    </View>
                </View>
                <View style={style.containerSocial}>
                    <TouchableOpacity style={[style.buttonSocial, { backgroundColor: '#fff', borderColor: '#ddd' }]}>
                        <View style={style.inner}>
                            <Image
                                source={require("../../assets/icon/google-icon.png")}
                                style={style.logo}
                            />
                            <Text style={[style.text, { color: '#000' }]}>Sign in  Google</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[style.buttonSocial, { backgroundColor: '#fff', borderColor: '#ddd' }]}>
                        <View style={style.inner}>
                            <Image
                                source={require("../../assets/icon/facebook-icon.png")}
                                style={style.logo}
                            />
                            <Text style={[style.text, { color: '#000' }]}>Sign in with Facebook</Text>
                        </View>
                    </TouchableOpacity>
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
    buttonPressed:{

    },
    button:{
        marginTop:12,
        paddingVertical: 15,
        margin:"auto",
        width:"100%",
        borderRadius:40
    },
    containerButton:{
      marginTop:24,
    },
    textRegister:{
        color:"white",
        fontSize:16,
        textAlign:"center"
    },
    textLine:{
        textAlign:"center",
        marginTop:-8,
    },
    buttonLogin:{
        backgroundColor:Colors.light.primary,
    },
    inputWrapper: {
        borderColor: Colors.light.primary,
        borderWidth: 1,
        borderRadius: 10,

        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 4,
        width:"84%",
        marginHorizontal:"auto",
        boxSizing: "border-box",
    },
    iconEmail: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: Colors.light.primary,
        padding: 0,
        width: "100%",
    },

    line:{
        height: 2,
        borderRadius:50,
        backgroundColor:Colors.light.text,
        flexGrow:1
    },

    containerInput:{
        width:"100%",
        marginHorizontal:"auto",
        marginTop:120,
    },
    container: {
        height: "100%",
        width: "100%",
        backgroundColor: Colors.light.background,
    },
    containerView: {
        marginHorizontal: "auto",
        marginTop: 70
    },
    containerTitle: {
        width: "80%" ,
        marginHorizontal: "auto",
    },

    containerLine:{
        height:20,
        justifyContent:"center",
        textAlign:"center",
        flexDirection:"row",
        flexWrap: "nowrap",
        marginTop:20,
        display:"flex",
        gap:12,
    },

    containerSocial: {
        alignItems: 'center',
        gap: 15,
        marginTop: 30,
    },
    buttonSocial: {
        width: '85%',
        borderRadius: 10,
        borderWidth: 1,
        paddingVertical: 12,
        alignItems: "center",
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
    },
})