import {Stack} from "expo-router";
import {useAuthContext} from "@/hooks/use-auth-contex";
import AuthProvider from "@/providers/auth-provider";
import {SplashScreenController} from "@/components/SplasScreenController";
import {StatusBar} from "expo-status-bar";

function RootNavigator() {
    const {isLoggedIn} = useAuthContext();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name="(auth)" options={{headerShown: false}}/>
                <Stack.Screen name="welcomescreen" index/>
            </Stack.Protected>

            <Stack.Protected guard={isLoggedIn}>
                <Stack.Screen name={"(tabs)"}/>
            </Stack.Protected>

        </Stack>
    )
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <SplashScreenController/>
            <RootNavigator/>
        </AuthProvider>
    );
}
