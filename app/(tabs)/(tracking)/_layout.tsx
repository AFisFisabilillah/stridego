import Home from "@/app/(tabs)/home";
import {Stack} from "expo-router";
import {GestureHandlerRootView} from "react-native-gesture-handler";

export default function TrackingLayout() {
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <Stack >
                <Stack.Screen options={{
                    headerShown:false
                }} name="index" />
            </Stack>
        </GestureHandlerRootView>
    )
}