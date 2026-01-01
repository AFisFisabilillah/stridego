import {SplashScreen} from "expo-router";
import {useAuthContext} from "@/hooks/use-auth-contex";

SplashScreen.preventAutoHideAsync()
export function SplashScreenController() {
    const { isLoading } = useAuthContext()
    if (!isLoading) {
        SplashScreen.hideAsync()
    }
    return null
}