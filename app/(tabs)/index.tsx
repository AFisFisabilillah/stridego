import {useContext} from "react";
import {useAuthContext} from "@/hooks/use-auth-contex";
import {SafeAreaView} from "react-native-safe-area-context";
import {Button, Text} from "react-native";
import SignOutButton from "@/components/LogoutButton";
import FriendRecommendCard from "@/components/FriendRecomendationCard";
import {router} from "expo-router";
import RunningMetricsCard from "@/components/RunningMetricsCard";
import UserStreakCard from "@/components/UserStreakCard";

export default function Index(){
    const auth = useAuthContext();
    const data = [
        {
            name: "Nabila Azzahra",
            mutual: 5,
            avatar: "https://i.pravatar.cc/150?img=5"
        },
        {
            name: "Rafi Pratama",
            mutual: 8,
            avatar: "https://i.pravatar.cc/150?img=12"
        }
    ];
    return(
        <>
            <SafeAreaView style={{height: "100%"}}>
                <Text>{auth.isLoggedIn && "hello"}</Text>
                {!auth.isLoading && auth.profile && (
                    <>
                        <Text>username : {auth.profile.username}</Text>
                        <Text>fullname : {auth.profile.fullname}</Text>
                    </>
                )}
                <UserStreakCard  showAnimation/>


                {data.map((item, index) => (
                    <FriendRecommendCard
                        key={index}
                        name={item.name}
                        mutual={item.mutual}
                        avatar={item.avatar}
                        onAdd={() => console.log("Tambah teman:", item.name)}
                    />
                ))}


                <SignOutButton></SignOutButton>

            </SafeAreaView>
        </>
    )
}