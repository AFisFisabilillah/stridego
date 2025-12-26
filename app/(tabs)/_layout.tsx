import {Tabs} from "expo-router";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {ChallengeProvider} from "@/providers/challenge-provider";

export default function TabsLayout() {
    return (
        <>
            <GestureHandlerRootView style={{flex: 1}}>
                <ChallengeProvider>
                    <Tabs screenOptions={{ headerShown: false }}>
                        <Tabs.Screen name="index" />
                        <Tabs.Screen name="(workout)" options={{ title: "Workout" ,tabBarStyle: { display: "none" }}} />
                        <Tabs.Screen
                            name="(tracking)"
                            options={{ title: "Run", tabBarStyle: { display: "none" } }}
                        />
                    </Tabs>
                </ChallengeProvider>
            </GestureHandlerRootView>
        </>
    );
}