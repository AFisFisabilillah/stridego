import { LinearGradient } from "react-native-svg"
import {StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, Alert} from "react-native";
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
import { Ionicons } from "@expo/vector-icons";
import {supabase} from "@/lib/supabase";

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
    const [logoutModal, setLogoutModal] = useState<boolean>(false);

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

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error('Error signing out:', error)
        }
        setLogoutModal(false);
    }

    useEffect(() => {
        fetchProfileStats();
        fetchActivities();
    }, []);

    return(<>
        <ScrollView style={[styles.container]} showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refresh}
                            onRefresh={handleRefresh}
                            colors={[Colors.light.primary]}
                            tintColor={Colors.light.primary}
                        />
                    }>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => setLogoutModal(true)}
                >
                    <Ionicons name="log-out-outline" size={24} color={Colors.light.danger} />
                </TouchableOpacity>
            </View>

            <View style={styles.containerPhoto}>
                <ProfilePhoto size={100} imageUri={profile?.avatar_url || require("@/assets/no_profile.jpeg")}/>
                <View>
                    <Text style={styles.textUsername}>{profile?.username}</Text>
                    <Text style={styles.textFullname}>{profile?.fullname}</Text>
                </View>
            </View>
            <View style={styles.containerStat}>
                <ProfilesStats followers={statistik.followers} following={statistik.following} posts={statistik.activities} separatorColor={Colors.light.primary}/>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    color={Colors.light.secondary}
                    handlePress={()=>{setUpdateModal(true)}}
                    label={"Edit Profile"}
                    style={styles.editButton}
                />

            </View>

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

        {/* Logout Confirmation Modal */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={logoutModal}
            onRequestClose={() => setLogoutModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Ionicons name="log-out-outline" size={48} color={Colors.light.danger} />
                        <Text style={styles.modalTitle}>Konfirmasi Logout</Text>
                        <Text style={styles.modalSubtitle}>
                            Apakah Anda yakin ingin keluar dari akun ini?
                        </Text>
                    </View>

                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setLogoutModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Batal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.confirmButtonText}>Ya, Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    </>)
}

const styles = StyleSheet.create({
    container:{
        marginHorizontal:20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.light.primary,
    },
    logoutButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },
    containerPhoto:{
        marginTop:10,
        alignItems:"center",
    },
    containerStat:{},
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
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    editButton: {
        flex: 1,
    },
    logoutButtonLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.2)',
    },
    logoutButtonText: {
        color: Colors.light.danger,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
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
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.light.danger,
        marginTop: 16,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: Colors.light.paragraph,
        textAlign: 'center',
        lineHeight: 22,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        color: Colors.light.paragraph,
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: Colors.light.danger,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileScreen;