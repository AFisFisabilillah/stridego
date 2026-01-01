import {Stack} from "expo-router";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {StyleSheet} from "react-native";
import {ActivityProvider} from "@/providers/activity-tracking-provider";

export default function TrackingLayout() {
    // @ts-ignore
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <ActivityProvider>
                <Stack>
                    <Stack.Screen options={{
                        headerShown:false
                    }} name="running" />
                    <Stack.Screen name={"activity"} options={{
                        title:"Simpan Aktivitas",
                        //@ts-ignore
                        headerTitleStyle:StyleSheet.create({
                            //@ts-ignore
                            fontWeight:"bold",
                            //@ts-ignore
                            fontSize:22
                        }),
                        headerShadowVisible:false,
                    }}/>
                </Stack>
            </ActivityProvider>
        </GestureHandlerRootView>
    )
}