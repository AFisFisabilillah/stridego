// screens/WorkoutSummaryScreen.tsx
import React, {useMemo, useRef, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {useLocalSearchParams, useRouter, Stack} from 'expo-router';
import {FontAwesome5, Ionicons} from '@expo/vector-icons';
import {Colors} from '@/constants/theme';
import {SafeAreaView} from "react-native-safe-area-context";
import {useChallenge} from "@/providers/challenge-provider";
import InputTheme from "@/components/InputTheme";
import {useImmer} from "use-immer";
import {Activity} from "@/types/activities";
import {useAuthContext} from "@/hooks/use-auth-contex";
import ImagePicker, {SelectedImage} from "@/components/ImagePicker";
import TextArea from "@/components/TextArea";
import {VISIBILITIES} from "@/app/(tabs)/(tracking)/activity";
import BottomSheet, {BottomSheetBackdrop, BottomSheetView} from "@gorhom/bottom-sheet";
import RadioButton from "@/components/RadioButton";
import {ButtonOutline} from "@/components/ButtonOutline";
import Button from "@/components/Button";
import {createActivityChallenge} from "@/services/activity.service";
import SuccessModal from "@/components/SuccessModal";
import {text} from "node:stream/consumers";

const WorkoutSummaryScreen: React.FC = () => {
    const userId = useAuthContext().session?.user.id;
    const router = useRouter();
    const {challengeDay,idChallengeJoin} = useChallenge();
    const {workoutCompleted} = useChallenge();
    const [currentVisibility, setCurrentVisibility] = useState(VISIBILITIES[0]);
    const [images,setImages] = useState<SelectedImage[]>([]);
    const [activity, setActivity] = useImmer<Activity>({
        title:"",
        //@ts-ignore
        calorie:Math.floor(workoutCompleted?.avgCalorie)||0,
        type:"workout",
        description:"",
        visibility:" ",
        //@ts-ignore
        duration:workoutCompleted?.totalTime,
        //@ts-ignore
        user_id: userId
    });
    const [modalSucces,setModalSucces] = useState<boolean>(false);
    const [loading,setLoading] = useState<boolean>(false);
    const bottomSheetVisibility = useRef<BottomSheet | null>(null);
    const snapPoints = useMemo(() => ["60%", "70%", "100%"], []);
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    function handleOpenBottomSheetVisibility() {
        bottomSheetVisibility.current?.snapToIndex(1);
    }

    function handleChangeVisibility(index: number) {
        setCurrentVisibility(VISIBILITIES[index]);
        setActivity(draft => {
            draft.visibility = VISIBILITIES[index].name
        })
        bottomSheetVisibility.current?.close()
    }

    async function hadleCreateActivity(){
        try {
            setLoading(true);
            //@ts-ignore
            await createActivityChallenge(activity,images,idChallengeJoin,challengeDay?.id,workoutCompleted );
        }catch (e){
            console.error(e);
        }finally {
            setLoading(false);
            setModalSucces(true)
        }

    }

    function handleImageSelected(images: SelectedImage[]) {
        setImages(images);
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{title: 'Workout Complete!', headerShown: false}}/>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.celebration}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="trophy" size={80} color={Colors.light.warning}/>
                    </View>
                    <Text style={styles.title}>Workout Complete!</Text>
                    <Text style={styles.subtitle}>Great job completing your workout</Text>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="checkmark-circle" size={32} color={Colors.light.success}/>
                        <Text style={styles.statNumber}>{workoutCompleted?.completed_exercise}</Text>
                        <Text style={styles.statLabel}>Exercises</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="time" size={32} color={Colors.light.primary}/>
                        <Text style={styles.statNumber}>{formatTime(workoutCompleted?.totalTime)}</Text>
                        <Text style={styles.statLabel}>Total Time</Text>
                    </View>

                    <View style={styles.statCard}>
                        <FontAwesome5 name="fire-alt" size={24} color={Colors.light.primary}/>
                        <Text style={styles.statNumber}>{workoutCompleted?.avgCalorie.toFixed(2)}</Text>
                        <Text style={styles.statLabel}>Calorie</Text>
                    </View>
                </View>

                <View>
                    <InputTheme style={{width:"100%"}} placeholder={"masukan nama latihan anda pagi hari ini"} value={activity?.title || ""} onChangeText={(text)=>{setActivity(draft => {draft.title=text})}}/>
                    <TextArea placeholder={"Masukan Deskripsi anda"} value={activity?.description || ""} onChangeText={(text)=>{setActivity(draft => {draft.description=text})}}/>
                    <ImagePicker onImagesSelected={handleImageSelected} maxSelection={4}/>

                    <View style={styles.visibilitasContainer}>
                        <Text style={styles.visibiltasText}>Visibilitas</Text>
                        <TouchableOpacity
                            onPress={handleOpenBottomSheetVisibility}
                            style={styles.inputType}
                        >
                            {currentVisibility.icon}
                            <Text style={styles.textType}>{currentVisibility.name}</Text>
                        </TouchableOpacity>
                    </View>
                    <ButtonOutline color={"red"} disable={false} handlePress={()=>{}} text={"Hapuss"}/>
                    <Button  color={Colors.light.primary} handlePress={hadleCreateActivity} label={"Simpan"}/>
                </View>
                {/*<View style={styles.actions}>*/}
                {/*    <TouchableOpacity*/}
                {/*        style={[styles.button, styles.primaryButton]}*/}
                {/*        onPress={() => router.replace('/')}*/}
                {/*    >*/}
                {/*        <Ionicons name="home" size={24} color={Colors.light.card}/>*/}
                {/*        <Text style={styles.buttonText}>Back to Home</Text>*/}
                {/*    </TouchableOpacity>*/}

                {/*    <TouchableOpacity*/}
                {/*        style={[styles.button, styles.secondaryButton]}*/}
                {/*        onPress={() => router.back()}*/}
                {/*    >*/}
                {/*        <Ionicons name="repeat" size={24} color={Colors.light.primary}/>*/}
                {/*        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Do Again</Text>*/}
                {/*    </TouchableOpacity>*/}
                {/*</View>*/}
            </ScrollView>
            <SuccessModal  visible={modalSucces} onClose={()=>{
                setModalSucces(false);
                router.dismissAll();
                router.replace("/");
            }}/>
            <BottomSheet
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        {...props}
                        appearsOnIndex={1}
                        disappearsOnIndex={0}
                        opacity={0.5}
                    />
                )}
                enablePanDownToClose={true}
                snapPoints={snapPoints}
                ref={bottomSheetVisibility}
                index={-1}
            >
                <BottomSheetView style={styles.visibilitasBottomSheet}>
                    <View style={[styles.headerTrackingTypes, {paddingHorizontal: 0}]}>
                        <Text style={styles.headerTrackingTypesText}>Pilih Visibilitas</Text>
                        <View style={styles.lineHeader}></View>
                    </View>
                    {VISIBILITIES.map((item, index) => (
                        <View key={index}>
                            <TouchableOpacity
                                onPress={() => handleChangeVisibility(index)}
                                style={styles.visibilityWrapper}
                            >
                                <View style={styles.visibilityTextWrapper}>
                                    <Text style={styles.visibiltyTextTitle}>{item.name}</Text>
                                    <Text style={styles.visibiltyTextDescription}>{item.description}</Text>
                                </View>
                                <RadioButton
                                    checked={item.name === currentVisibility.name}
                                    onPress={() => handleChangeVisibility(index)}
                                />
                            </TouchableOpacity>
                            <View style={styles.lineHeader}></View>
                        </View>
                    ))}
                </BottomSheetView>
            </BottomSheet>
        </SafeAreaView>


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        padding: 20,
        justifyContent: 'center',
        flexGrow: 1,
    },
    celebration: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        backgroundColor: Colors.light.warning + '15',
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    lineHeader: {
        width: "100%",
        height: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        marginTop: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Colors.light.card,
        padding: 20,
        borderRadius: 16,
        marginHorizontal: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginVertical: 8,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.textSecondary,
    },
    actions: {
        width: '100%',
        gap: 16,
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: Colors.light.primary,
    },
    secondaryButton: {
        backgroundColor: Colors.light.surface,
        borderWidth: 2,
        borderColor: Colors.light.primary,
    },
    buttonText: {
        color: Colors.light.card,
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButtonText: {
        color: Colors.light.primary,
    },

//     INPUT,
    containerInput:{
        width: '100%',
    },
    inputTitle: {
        height: 58,
        marginBottom: 10,
    },
    inputType: {
        height: 48,
        width: "100%",
        borderWidth: 1.5,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        backgroundColor: '#fefefe',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
        marginBottom: 10,
    },
    textType: {
        fontSize: 16,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    visibilitasContainer: {
        marginTop: 6,
        marginBottom: 10,
    },
    visibiltasText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    visibilitasBottomSheet: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    visibilityWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    visibilityTextWrapper: {
        width: "78%",
    },
    visibiltyTextTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "rgba(0,0,0,.8)",
        textTransform: 'capitalize',
        marginBottom: 4,
    },
    visibiltyTextDescription: {
        fontSize: 14,
        color: "rgba(0,0,0,.5)",
    },
    headerTrackingTypes: {
        paddingHorizontal: 20,
        width: "100%",
        marginBottom: 20,
    },
    headerTrackingTypesText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default WorkoutSummaryScreen;