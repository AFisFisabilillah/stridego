import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export const SignInGoogle = () => {
    async function handlePress() {
        console.log("tombol di pencet");

        const redirectUri = AuthSession.makeRedirectUri({
            useProxy: true,
        });

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: redirectUri,
            },
        });

        if (error) {
            console.log("ERROR:", error);
            return;
        }

        if (data?.url) {
            await WebBrowser.openAuthSessionAsync(
                data.url,
                redirectUri
            );
        }
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[style.buttonSocial, { backgroundColor: "#fff", borderColor: "#ddd" }]}
        >
            <View style={style.inner}>
                <Image
                    source={require("@/assets/icon/google-icon.png")}
                    style={style.logo}
                />
                <Text style={[style.text, { color: "#000" }]}>
                    Sign in Google
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const style = StyleSheet.create({
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