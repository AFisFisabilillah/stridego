import Home from "@/app/(tabs)/home";
import {Stack} from "expo-router";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {StyleSheet} from "react-native";
import {ActivityProvider} from "@/providers/activity-tracking-provider";

export default function TrackingLayout() {
    // @ts-ignore
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <ActivityProvider>
                <Stack >
                    <Stack.Screen options={{
                        headerShown:false
                    }} name="index" />
                    <Stack.Screen name={"activity"} options={{
                        title:"Simpan Aktivitas",
                        headerTitleStyle:StyleSheet.create({
                            fontWeight:"bold",
                            fontSize:22
                        }),
                        headerShadowVisible:true,
                    }}/>
                </Stack>
            </ActivityProvider>
        </GestureHandlerRootView>
    )
}