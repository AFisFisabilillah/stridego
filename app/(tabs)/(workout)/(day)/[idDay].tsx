import {useLocalSearchParams} from "expo-router/build/hooks";
import {Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useEffect, useMemo, useRef, useState} from "react";
import {Exercise, ExerciseDay} from "@/types/challenge";
import {getDayExercise} from "@/services/challange.service";
import {useImmer} from "use-immer";
import ExerciseCard from "@/components/ExerciseCard";
import BottomSheet, {BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView} from "@gorhom/bottom-sheet";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "@/constants/theme";
import LottieView from "lottie-react-native";
import {useChallenge} from "@/providers/challenge-provider";
import {ButtonOutline} from "@/components/ButtonOutline";
import {router} from "expo-router";

const DetailDay = () => {
    const {idDay} = useLocalSearchParams();
    const {exerciseDays, setExerciseDays} = useChallenge();
    const [exerciseDetail, setExerciseDetail] = useImmer<Exercise | null>(null);
    const [exercises, setExercises] = useImmer<ExerciseDay[]>([]);
    const [currentExerciseDay, setCurrentExerciseDay] = useImmer<ExerciseDay | null>(null);

    const snapPoints = useMemo(() => ["60%", "90%"], []);
    const bottomSheetDetailExercise = useRef<BottomSheet | null>(null);

    async function fetchExercise() {
        //@ts-ignore
        const data = await getDayExercise(idDay);
        setExerciseDays(data);
        setExercises(data);
    }

    useEffect(() => {
        fetchExercise();
    }, [idDay]);

    const handleOnPress = (item: ExerciseDay) => {
        bottomSheetDetailExercise.current?.snapToIndex(1);
        setExerciseDetail(item.exercise);
        setCurrentExerciseDay(item);
    };

    const handleCloseSheet = () => {
        bottomSheetDetailExercise.current?.close();
    };

    const renderBackdrop = (props: any) => (
        <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.5}
        />
    );

    // Fungsi untuk memformat daftar otot dengan koma
    const formatMuscleGroups = (muscles: string) => {
        if (!muscles) return "";
        return muscles.split(',').map(muscle => muscle.trim()).join(', ');
    };

    return (
        <>
            <FlatList
                ListHeaderComponent={
                    <View>
                        <ButtonOutline color={Colors.light.primary} handlePress={()=>{
                            router.push("/(workout)/workout-player")
                        }} text={"Start"}/>
                    </View>
                }
                style={styles.containerExercise}
                data={exercises}
                renderItem={({item}) => (
                    <ExerciseCard
                        key={item.id}
                        onPress={() => handleOnPress(item)}
                        exercise={item.exercise}
                        duration={item.duration_second}
                        reps={item.reps}
                    />
                )}
                contentContainerStyle={styles.listContainer}
            />



            <BottomSheet
                ref={bottomSheetDetailExercise}
                snapPoints={snapPoints}
                index={-1}
                enablePanDownToClose={true}
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetScrollView
                    style={styles.bottomSheetContent}
                    showsVerticalScrollIndicator={false}
                >
                    {exerciseDetail && (
                        <View style={styles.exerciseDetailContainer}>
                            {/* Header dengan tombol close */}
                            <View style={styles.header}>
                                <Text style={styles.exerciseTitle}>{exerciseDetail.name}</Text>
                                <TouchableOpacity
                                    onPress={handleCloseSheet}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color={Colors.light.textSecondary}/>
                                </TouchableOpacity>
                            </View>

                            {/* Gambar Exercise */}
                            {exerciseDetail.image ? (
                                <View style={styles.imageContainer}>
                                    <LottieView
                                        source={{uri: exerciseDetail.image}}
                                        style={styles.exerciseImage}
                                        autoPlay
                                        loop
                                    />
                                    <View style={styles.imageOverlay}/>
                                </View>
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="fitness" size={60} color={Colors.light.primary}/>
                                    <Text style={styles.placeholderText}>No Image Available</Text>
                                </View>
                            )}

                            {/* Stats Container */}
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <View
                                        style={[styles.statIconContainer, {backgroundColor: Colors.light.primary + '20'}]}>
                                        <Ionicons name="time-outline" size={20} color={Colors.light.primary}/>
                                    </View>
                                    <View style={styles.statContent}>
                                        <Text style={styles.statLabel}>Duration</Text>
                                        <Text style={styles.statValue}>
                                            {currentExerciseDay?.duration_second || 0}s
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.statDivider}/>

                                <View style={styles.statItem}>
                                    <View
                                        style={[styles.statIconContainer, {backgroundColor: Colors.light.success + '20'}]}>
                                        <Ionicons name="repeat-outline" size={20} color={Colors.light.success}/>
                                    </View>
                                    <View style={styles.statContent}>
                                        <Text style={styles.statLabel}>Reps</Text>
                                        <Text style={styles.statValue}>
                                            {currentExerciseDay?.reps || 0}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.statDivider}/>

                                <View style={styles.statItem}>
                                    <View
                                        style={[styles.statIconContainer, {backgroundColor: Colors.light.warning + '20'}]}>
                                        <Ionicons name="flame-outline" size={20} color={Colors.light.warning}/>
                                    </View>
                                    <View style={styles.statContent}>
                                        <Text style={styles.statLabel}>MET</Text>
                                        <Text style={styles.statValue}>
                                            {exerciseDetail.met}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Muscle Groups */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="body-outline" size={22} color={Colors.light.primary}/>
                                    <Text style={styles.sectionTitle}>Target Muscles</Text>
                                </View>
                                <View style={styles.musclesContainer}>
                                    {exerciseDetail.otot.split(',').map((muscle, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.muscleChip,
                                                {backgroundColor: Colors.light.primary + '15'}
                                            ]}
                                        >
                                            <Text style={styles.muscleText}>
                                                {muscle.trim()}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                <Text style={styles.muscleList}>
                                    {formatMuscleGroups(exerciseDetail.otot)}
                                </Text>
                            </View>

                            {/* Description */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="document-text-outline" size={22} color={Colors.light.primary}/>
                                    <Text style={styles.sectionTitle}>Description</Text>
                                </View>
                                <Text style={styles.descriptionText}>
                                    {exerciseDetail.description || "No description available for this exercise."}
                                </Text>
                            </View>

                            {/* Tips Section */}
                            <View style={styles.sectionContainer}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="bulb-outline" size={22} color={Colors.light.warning}/>
                                    <Text style={styles.sectionTitle}>Exercise Tips</Text>
                                </View>
                                <View style={styles.tipsContainer}>
                                    <View style={styles.tipItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={Colors.light.success}/>
                                        <Text style={styles.tipText}>
                                            Maintain proper form throughout the exercise
                                        </Text>
                                    </View>
                                    <View style={styles.tipItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={Colors.light.success}/>
                                        <Text style={styles.tipText}>
                                            Breathe consistently - exhale on exertion
                                        </Text>
                                    </View>
                                    <View style={styles.tipItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={Colors.light.success}/>
                                        <Text style={styles.tipText}>
                                            Start with lighter weight to perfect form
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </BottomSheetScrollView>
            </BottomSheet>
        </>
    );
};

export default DetailDay;

const styles = StyleSheet.create({
    containerExercise: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingVertical: 20,
        gap: 12,
    },
    bottomSheetBackground: {
        backgroundColor: Colors.light.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    handleIndicator: {
        backgroundColor: Colors.light.border,
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    bottomSheetContent: {
        flex: 1,
    },
    exerciseDetailContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 4,
    },
    exerciseTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        flex: 1,
        marginRight: 16,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    imageContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    exerciseImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    imagePlaceholder: {
        height: 200,
        borderRadius: 16,
        backgroundColor: Colors.light.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.light.border,
        marginHorizontal: 12,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginLeft: 8,
    },
    musclesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    muscleChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.light.primary + '30',
    },
    muscleText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.primary,
    },
    muscleList: {
        fontSize: 14,
        color: Colors.light.paragraph,
        lineHeight: 20,
    },
    descriptionText: {
        fontSize: 14,
        color: Colors.light.paragraph,
        lineHeight: 22,
    },
    tipsContainer: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: Colors.light.paragraph,
        lineHeight: 20,
    },
});
