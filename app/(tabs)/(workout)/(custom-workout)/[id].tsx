// screens/CustomWorkoutDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import {useLocalSearchParams} from "expo-router/build/hooks";
import {router} from "expo-router";
import {Exercise} from "@/types/challenge";
import {CustomWorkoutExercise} from "@/types/custom-workout";
import {deleteCustomWorkout, getDetailCustomWorkout} from "@/services/custom-workout.service";





interface CustomWorkoutDetail {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
    exercises: CustomWorkoutExercise[];
}

const CustomWorkoutDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id:workoutId } = useLocalSearchParams<{id:string}>()

    const [workout, setWorkout] = useState<CustomWorkoutDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchWorkoutDetail();
    }, [workoutId]);

    const fetchWorkoutDetail = async () => {
        try {
            const data = await getDetailCustomWorkout(workoutId as string);
            setWorkout(data);
        } catch (error: any) {
            console.error('Error fetching workout detail:', error);
            Alert.alert('Error', 'Failed to load workout details');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalDuration = () => {
        if (!workout) return 0;

        return workout.exercises.reduce((total, exercise) => {
            return total + (exercise.duration_second || 0);
        }, 0);
    };

    const calculateEstimatedCalories = () => {
        if (!workout) return 0;

        let totalCalories = 0;

        workout.exercises.forEach((item) => {
            console.log("item cusrtomWorkout", item.duration_second)
            if (item.exercise && item.duration_second) {
                const metValue = item.exercise.met;
                const minutes = item.duration_second / 60;
                const calories = (metValue * 3.5 * 70 * minutes) / 200;
                totalCalories += calories;
                console.log("calories : ", calories)
            }
        });

        return Math.round(totalCalories);
    };

    const handleStartWorkout = () => {
        Alert.alert(
            'Start Workout',
            'Are you ready to start this workout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start',
                    style: 'default',
                    onPress: () => {
                        // Navigate to workout execution screen
                        router.push(`/(start)/${workoutId}`)
                    }
                },
            ]
        );
    };

    const handleEditWorkout = () => {
        router.push(`/(edit)/${workoutId}`)
    };

    const handleDeleteWorkout = () => {
        Alert.alert(
            'Delete Workout',
            'Are you sure you want to delete this workout? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: deleteWorkout
                },
            ]
        );
    };

    const deleteWorkout = async () => {
        setDeleting(true);
        try {
            // First delete the exercises
           await deleteCustomWorkout(workoutId);

            Alert.alert(
                'Success',
                'Workout deleted successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error deleting workout:', error);
            Alert.alert('Error', 'Failed to delete workout');
        } finally {
            setDeleting(false);
        }
    };



    const ExerciseLottie: React.FC<{ image: string; size?: number }> = ({ image, size = 60 }) => {
        const [hasError, setHasError] = useState(false);

        if (hasError || !image) {
            return (
                <View style={[styles.lottiePlaceholder, { width: size, height: size }]}>
                    <Text style={styles.placeholderText}>🏋️</Text>
                </View>
            );
        }

        return (
            <LottieView
                source={{uri:image}}
                autoPlay
                loop
                style={{ width: size, height: size }}
                resizeMode="contain"
                onAnimationFailure={() => setHasError(true)}
            />
        );
    };

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0
            ? `${minutes}m ${remainingSeconds}s`
            : `${minutes}m`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Loading workout details...</Text>
            </View>
        );
    }

    if (!workout) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={60} color={Colors.light.gray} />
                <Text style={styles.errorText}>Workout not found</Text>
                <TouchableOpacity
                    style={styles.errorButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.errorButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const totalDuration = calculateTotalDuration();
    const estimatedCalories = calculateEstimatedCalories();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.light.background} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Workout Details</Text>
                </View>

                {/* Workout Info Card */}
                <View style={styles.workoutInfoCard}>
                    <Text style={styles.workoutTitle}>{workout.title}</Text>

                    {workout.description && (
                        <Text style={styles.workoutDescription}>{workout.description}</Text>
                    )}

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name="barbell-outline" size={20} color={Colors.light.primary} />
                            <Text style={styles.statValue}>{workout.exercises.length}</Text>
                            <Text style={styles.statLabel}>Exercises</Text>
                        </View>

                        {totalDuration > 0 && (
                            <View style={styles.statItem}>
                                <Ionicons name="time-outline" size={20} color={Colors.light.primary} />
                                <Text style={styles.statValue}>{formatDuration(totalDuration)}</Text>
                                <Text style={styles.statLabel}>Duration</Text>
                            </View>
                        )}

                        {estimatedCalories > -1 && (
                            <View style={styles.statItem}>
                                <Ionicons name="flame-outline" size={20} color={Colors.light.primary} />
                                <Text style={styles.statValue}>{estimatedCalories}</Text>
                                <Text style={styles.statLabel}>Calories</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Exercises Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Exercises ({workout.exercises.length})</Text>

                    {workout.exercises.map((item, index) => (
                        <View key={item.id} style={styles.exerciseCard}>
                            <View style={styles.exerciseHeader}>
                                <View style={styles.exerciseNumber}>
                                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                                </View>

                                <View style={styles.lottieContainer}>
                                    <ExerciseLottie image={item.exercise?.image || ""} size={50} />
                                </View>

                                <View style={styles.exerciseInfo}>
                                    <Text style={styles.exerciseName}>{item.exercise?.name}</Text>
                                    {item.exercise?.otot && (
                                        <Text style={styles.exerciseMuscle}>{item.exercise?.otot}</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.exerciseDetails}>
                                {(item.reps || item.duration_second) && (
                                    <View style={styles.detailRow}>
                                        {item.reps && (
                                            <View style={styles.detailItem}>
                                                <Ionicons name="repeat-outline" size={16} color={Colors.light.gray} />
                                                <Text style={styles.detailText}>{item.reps} reps</Text>
                                            </View>
                                        )}

                                        {item.duration_second && (
                                            <View style={styles.detailItem}>
                                                <Ionicons name="timer-outline" size={16} color={Colors.light.gray} />
                                                <Text style={styles.detailText}>{formatDuration(item.duration_second)}</Text>
                                            </View>
                                        )}

                                        <View style={styles.detailItem}>
                                            <Ionicons name="speedometer-outline" size={16} color={Colors.light.gray} />
                                            <Text style={styles.detailText}>MET: {item.exercise?.met}</Text>
                                        </View>
                                    </View>
                                )}

                                {item.exercise?.description && (
                                    <Text style={styles.exerciseDescription}>
                                        {item.exercise?.description}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDeleteWorkout}
                    disabled={deleting}
                >
                    {deleting ? (
                        <ActivityIndicator size="small" color={Colors.light.background} />
                    ) : (
                        <>
                            <Ionicons name="trash-outline" size={20} color={Colors.light.background} />
                            <Text style={styles.actionButtonText}>Delete</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={handleEditWorkout}
                >
                    <Ionicons name="create-outline" size={20} color={Colors.light.background} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.startButton]}
                    onPress={handleStartWorkout}
                >
                    <Ionicons name="play" size={20} color={Colors.light.background} />
                    <Text style={styles.actionButtonText}>Start Workout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.light.gray,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginTop: 16,
        marginBottom: 24,
    },
    errorButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    errorButtonText: {
        color: Colors.light.background,
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.light.primary,
        paddingTop: 50,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.background,
    },
    workoutInfoCard: {
        backgroundColor: Colors.light.background,
        margin: 20,
        marginTop: -40,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    workoutTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 12,
    },
    workoutDescription: {
        fontSize: 14,
        color: Colors.light.gray,
        lineHeight: 20,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: Colors.light.gray + '20',
        paddingTop: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.gray,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 16,
    },
    exerciseCard: {
        backgroundColor: Colors.light.background,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.gray + '20',
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    exerciseNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    exerciseNumberText: {
        color: Colors.light.background,
        fontWeight: '600',
        fontSize: 14,
    },
    lottieContainer: {
        marginRight: 12,
    },
    lottiePlaceholder: {
        backgroundColor: Colors.light.primary + '10',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 20,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 4,
    },
    exerciseMuscle: {
        fontSize: 13,
        color: Colors.light.primary,
        fontWeight: '500',
        backgroundColor: Colors.light.primary + '10',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    exerciseDetails: {
        paddingLeft: 44,
    },
    detailRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    detailText: {
        fontSize: 12,
        color: Colors.light.gray,
        marginLeft: 6,
    },
    exerciseDescription: {
        fontSize: 12,
        color: Colors.light.gray,
        lineHeight: 16,
        fontStyle: 'italic',
    },
    actionButtons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: Colors.light.background,
        padding: 16,
        paddingBottom:34,
        borderTopWidth: 1,
        borderTopColor: Colors.light.gray + '20',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginHorizontal: 4,
    },
    deleteButton: {
        backgroundColor: Colors.light.danger,
        flex: 0.8,
    },
    editButton: {
        backgroundColor: Colors.light.secondary,
        flex: 0.8,
    },
    startButton: {
        backgroundColor: Colors.light.primary,
        flex: 1.4,
    },
    actionButtonText: {
        color: Colors.light.background,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default CustomWorkoutDetailScreen;