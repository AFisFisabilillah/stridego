import {Tabs} from "expo-router";
import {GestureHandlerRootView} from "react-native-gesture-handler";

export default function TabsLayout(){
    return (
        <>
            <Tabs screenOptions={{
                headerShown:false
            }}>
                <Tabs.Screen name={"index"}/>
                <Tabs.Screen options={{
                    title: "Run",
                    tabBarStyle: {display:"none"}
                }} name={"(tracking)"}/>
            </Tabs>
        </>
    );
}