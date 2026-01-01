import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {Colors} from "@/constants/theme";
import {Image} from "expo-image";
import {FontAwesome, FontAwesome5, Fontisto} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {supabase} from "@/lib/supabase";
import {useImmer} from "use-immer";
import {useState} from "react";
import {SignInGoogle} from "@/components/SignInGoogle";

type LoginForm = {
    email: string;
    password: string;
};

export default function Login() {
    const router = useRouter();
    const [login, setLogin] = useImmer<LoginForm>({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useImmer<LoginForm>({
        email:"",
        password:"",
    });
    const [apiError,setApiError] = useState<string|null>("");
    const [loading, setLoading] = useState<boolean>(false);

    async function  handleRegistration():Promise<void> {
        let hasError = false;
        const regex:RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


        if (!regex.test(login.email)) {
            setErrors(draft => { draft.email = "Please enter a valid email address."; });
            hasError = true;
            return;
        }
        if(login.password.length < 1){
            setErrors(draft => { draft.password = "Please fill password"; });
            return
        }


        setLoading(true);
        supabase.auth.signInWithPassword({
            email:login.email,
            password:login.password
        }).then(result  => {
            if(result.error){
                console.log(result.error)
                setApiError(result.error.message);
                return
            }
            console.log(result.data)
            router.push({
                pathname:"/(tabs)/home",
                params:{
                    email:login.email,
                }
            });
        }) .catch((error) => {
            console.error("Unexpected error:", error);
            setApiError("Something was error, Please Try Again")
        }).finally(():void => setLoading(false));


    }

    function handleChangeEmail(email: string):void {
        if (errors.email) {
            setErrors(draft => { draft.email = ""; });
        }
        if (apiError) {
            setApiError(null);
        }

        setLogin(draft => {
            draft.email = email;
        });
    }
    function handleChangePassword(password: string):void{
        if (errors.password) {
            setErrors(draft => { draft.password = ""; });
        }
        if (apiError) {
            setApiError(null);
        }
        setLogin(draft => {
            draft.password = password;
        });
    }


    return (
        <>
            <SafeAreaView style={style.container}>
                <View style={style.containerView}>
                    <View style={style.containerTitle}>
                        <Text style={style.textTitle}>Login</Text>
                        <Text style={style.textSecond}>Mulai perjalanan lari terbaikmu sekarang.</Text>
                    </View>
                    <View style={style.containerInput}>
                        <View style={style.inputGroup}>
                            <View style={[style.inputWrapper, errors.email ? style.inputError : null]}>
                                <Fontisto
                                    style={style.iconEmail}
                                    name={"email"}
                                    color={errors.email ? 'red' : Colors.light.primary}
                                    size={22}
                                />
                                <TextInput
                                    style={style.textInput}
                                    placeholderTextColor={Colors.light.paragraph}
                                    inputMode={"email"}
                                    value={login.email}
                                    keyboardType={"email-address"}
                                    textContentType={"emailAddress"}
                                    placeholder={"Email Address"}
                                    autoCapitalize="none"
                                    onChangeText={handleChangeEmail}
                                />
                            </View>
                            {errors.email ? <Text style={style.errorText}>{errors.email}</Text> : null}
                        </View>
                        <View style={style.inputGroup}>
                            <View style={[style.inputWrapper, errors.password ? style.inputError : null]}>
                                <FontAwesome5
                                    style={style.iconEmail}
                                    name={"lock"}
                                    color={errors.password ? 'red' : Colors.light.primary}
                                    size={22}
                                />
                                <TextInput
                                    style={style.textInput}
                                    placeholderTextColor={Colors.light.paragraph}
                                    inputMode={"text"}
                                    value={login.password}
                                    onChangeText={handleChangePassword}
                                    textContentType={"password"}
                                    placeholder={"Password"}
                                    autoCapitalize="none"
                                    secureTextEntry={true}
                                />
                            </View>
                            {errors.password ? <Text style={style.errorText}>{errors.password}</Text> : null}
                        </View>
                    </View>


                    <View style={style.containerButton}>
                        {apiError ? <Text style={[style.errorText, { textAlign: 'center', marginBottom: 10 }]}>{apiError}</Text> : null}

                        <TouchableOpacity onPress={handleRegistration} disabled={loading} activeOpacity={.8} style={[style.button,style.buttonLogin,loading&&style.loading]}>
                            {loading ? <ActivityIndicator size="small" color={"#ffffff"} /> : <Text style={style.textLogin}>Login</Text>}
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={{width:"100%"}} onPress={()=>{
                        router.replace({
                            pathname: "/(auth)/register",
                        })
                    }}>
                        <Text style={style.textRegister}>Dont Have Acount ? SIgn up </Text>
                    </TouchableOpacity>
                    <View style={style.containerLine}>
                        <View style={style.line}></View>
                        <Text style={style.textLine}>Or</Text>
                        <View style={style.line}></View>
                    </View>
                </View>
                <View style={style.containerSocial}>
                   <SignInGoogle/>

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
    button:{
        marginTop:12,
        paddingVertical: 15,
        width:"100%",
        borderRadius:40
    },
    containerButton:{
        width: "84%",
        marginHorizontal: "auto",
        marginTop: 24,
    },
    textLogin:{
        color:"white",
        fontSize:16,
        textAlign:"center",
        fontWeight: '600',
    },
    textLine:{
        textAlign:"center",
        marginTop:-8,
        color: Colors.light.paragraph,
    },
    buttonLogin:{
        backgroundColor:Colors.light.primary,
    },
    inputGroup: {
        width: '100%',
        alignItems: 'center',
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
        boxSizing: "border-box",
    },

    inputError: {
        borderColor: 'red',
    },

    errorText: {
        color: 'red',
        fontSize: 14,
        textAlign: 'left',
    },
    iconEmail: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: Colors.light.text,
        padding: 0,
    },
    line:{
        height: 2,
        borderRadius:50,
        backgroundColor: Colors.light.primary,
        flexGrow:1,
        opacity: 0.3,
    },
    containerInput:{
        width:"100%",
        marginHorizontal:"auto",
        marginTop:100,
        gap: 12,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    containerView: {
        marginHorizontal: "auto",
        marginTop: 70,
        width: '100%',
        alignItems: 'center',
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
        width: '84%',
    },
    containerSocial: {
        alignItems: 'center',
        gap: 15,
        marginTop: 30,
        width: '100%',
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
    loading:{
        opacity:.6
    },
    textRegister:{
        fontSize: 13.5,
        color:Colors.light.text,
        textAlign:"right",
        opacity:.8,
        marginTop:6,
        marginRight:18,
    }
})