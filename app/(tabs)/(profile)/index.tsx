import { LinearGradient } from "react-native-svg"
import {StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl} from "react-native";
import ProfilePhoto from "@/components/ProfilePhoto";
import ProfilesStats from "@/components/ProfilesStats";
import {Colors} from "@/constants/theme";
import Button from "@/components/Button";
import {useAuthContext} from "@/hooks/use-auth-contex";
import React, {useEffect, useState} from "react";
import {useImmer} from "use-immer";
import { countingFollowers} from "@/services/followers.service";
import {countActivity} from "@/services/activity.service";
import UpdateProfileModal from "@/components/UpdateProfileModal";
import {ActivityCard as ActivityCardType, fetchUserActivities} from '@/services/load-activity.servise';
import ActivityCard from "@/components/ActivityCard";
import {router} from "expo-router";

interface ProfileStatistik {
    followers:number;
    following:number;
    activities:number;
}

 const ProfileScreen= () => {
     const profile = useAuthContext().profile;
     const user = useAuthContext().session?.user
     const [tab, setTab] = useState<"aktivitas"|"statistik">("aktivitas");
     const [statistik, setStatistik] = useImmer<ProfileStatistik>({
         activities:0,
         followers:0,
         following:0,
     });
     const [refresh , setRefresh ] = useState(false);
     const [activities, setActivities] = useImmer<ActivityCardType[]>([]);
     const [updateModal, setUpdateModal] = useState<boolean>(false);

     async function fetchProfileStats() {
         if(user?.id){
             const {countFollowing,countFollowers}= await countingFollowers(user?.id);
             const countActivitise = await countActivity(user?.id);
             setStatistik(draft => {
                 draft.activities = countActivitise || 0;
                 draft.followers = countFollowers || 0;
                 draft.following = countFollowing || 0;
             })
         }
     }

     async function handleRefresh() {
         setRefresh(true)
         await fetchProfileStats();
         await fetchActivities();
         setRefresh(false);
     }

     const fetchActivities = async ()=>{
         if (user?.id){
             const data = await fetchUserActivities(user.id)
             setActivities(data)
         }
     }

     const handlePressActivity=(activityId:string)=>{
         router.push(`/(activity)/${activityId}`)
     }
     useEffect(() => {
         fetchProfileStats();
         fetchActivities();
     }, []);
    return(<>
        <ScrollView style={[styles.container]}showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refresh}
                            onRefresh={handleRefresh}
                            colors={[Colors.light.primary]}
                            tintColor={Colors.light.primary}
                        />
                    }>
            <View style={styles.containerPhoto}>
                <ProfilePhoto size={100} imageUri={profile.avatar_url ?? require("../../../assets/no_profile.jpeg")}/>
                <View>
                    <Text style={styles.textUsername}>{profile?.username}</Text>
                    <Text style={styles.textFullname}>{profile?.fullname}</Text>
                </View>
            </View>
            <View style={styles.containerStat}>
                <ProfilesStats followers={statistik.followers} following={statistik.following} posts={statistik.activities} separatorColor={Colors.light.primary}/>
            </View>
            <Button color={Colors.light.secondary} handlePress={()=>{setUpdateModal(true)}} label={"Edit Profiel"}/>
            <View style={styles.containerButton}>
                <TouchableOpacity
                    onPress={()=>{setTab("aktivitas")}}
                    style={[styles.buttonInner, tab === "aktivitas" && (styles.buttonActive)]}>
                    <Text style={[styles.buttonText,tab === "aktivitas" && (styles.buttonTextActive)]}>Aktivitas</Text>
                </TouchableOpacity>
                {/*<TouchableOpacity*/}
                {/*    onPress={()=>{setTab("statistik")}}*/}
                {/*    style={[styles.buttonInner, tab === "statistik" && (styles.buttonActive)]}>*/}
                {/*    <Text style={[styles.buttonText,tab === "statistik" && (styles.buttonTextActive)]}>Statistik</Text>*/}
                {/*</TouchableOpacity>*/}
            </View>
            {
                tab === "statistik" && (
                    <View>
                        <Text>aktivitas</Text>
                    </View>
                )
            }
            {
                tab === "aktivitas" && (
                    <View  style={styles.activityContainer}>
                        {activities.map(value => {
                            return <ActivityCard onPress={()=>{handlePressActivity(value.id)}} key={value.id} activity={value}/>
                        })}
                    </View>
                )
            }
            <UpdateProfileModal
                visible={updateModal}
                onClose={()=>{setUpdateModal(false)}}
                initialProfile={{
                    username: profile?.username || '',
                    fullname: profile?.fullname || '',
                    gender: profile?.gender || '',
                    weight: profile?.weight || 0,
                    height: profile?.height || 0,
                    avatar_url: profile?.avatar_url || '',
                }}/>
        </ScrollView>
    </>)
}

const styles = StyleSheet.create({
    container:{
        marginHorizontal:20

    },
    containerPhoto:{
        marginTop:30,
        alignItems:"center",
    },
    containerStat:{
    },
    textUsername:{
        fontSize:18,
        fontWeight:'600',
        textAlign:"center",
        marginTop:-20
    },
    textFullname:{
        fontSize:16,
        fontWeight:'600',
        textAlign:"center",
        color:"#121212"
    },
    containerButton:{
        marginTop:30,
        borderRadius:30,
        padding:5,
        backgroundColor:"#dadada",
        borderWidth:1,
        borderColor:"#9e9e9e",
        flexDirection:'row',
        elevation:2,
    },
    buttonInner:{
        flex:1,
        borderRadius:30,
        padding:8,
    },
    buttonText:{
        fontSize:15,
        color:Colors.light.paragraph,
        textAlign:"center"
    },
    buttonActive:{
        backgroundColor:Colors.light.primary,
    },
    buttonTextActive:{
        color:"white",
    },
    activityContainer:{
        marginTop:20
    }
});

export default ProfileScreen;
