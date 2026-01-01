import {Tabs} from "expo-router";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {ChallengeProvider} from "@/providers/challenge-provider";
import {Feather, MaterialCommunityIcons} from "@expo/vector-icons";
import Run from "@/assets/icon/Run";

export default function TabsLayout() {
    return (
        <>
            <GestureHandlerRootView style={{flex: 1}}>
                <ChallengeProvider>
                    <Tabs screenOptions={{ headerShown: false }}>
                        <Tabs.Screen options={{
                            title:"Home",
                            tabBarIcon:({focused, color,size}) =>(
                                <Feather name="home" size={size} color={color} />
                            )
                        }} name="(workout)"/>
                        <Tabs.Screen
                            name="(tracking)"
                            options={ {
                                tabBarStyle: { display: "none" },
                                title:"Run",
                                tabBarIcon:({focused, color,size}) =>(
                                    <Run width={size} height={size} fill={color}/>
                                )
                        }}

                        />
                        <Tabs.Screen
                            name={"(search)"}
                            options={ {
                                title:"Search ",
                                tabBarIcon:({focused, color,size}) =>(
                                    <MaterialCommunityIcons name="account-search-outline" size={size} color={color} />       )
                        }}
                        />
                        <Tabs.Screen
                            name="(profile)"
                            options={ {
                                title:"Profile",
                                tabBarIcon:({focused, color,size}) =>(
                                    <Feather name="user" size={size} color={color} />                                )
                            }}
                        />
                    </Tabs>
                </ChallengeProvider>
            </GestureHandlerRootView>
        </>
    );
}