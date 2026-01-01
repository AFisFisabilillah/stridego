// screens/WorkoutPlayerScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseDay } from '@/types/challenge';
import { Colors } from '@/constants/theme';
import {RestTimer} from '@/components/RestTimer';
import { WorkoutStatus, WorkoutPhase } from '@/types/challenge';
import {useChallenge} from "@/providers/challenge-provider";
import {SafeAreaView} from "react-native-safe-area-context";
import {saveProgressChallenge} from "@/services/challange.service";
import {useAuthContext} from "@/hooks/use-auth-contex";
import {calculateCaloriesFromExercises} from "@/utils/calculateCalories";

const { width, height } = Dimensions.get('window');
const REST_DURATION = 120;



const WorkoutPlayerScreen: React.FC = () => {
    const router = useRouter();
    const {exerciseDays,setWorkoutCompleted, challengeDay,idChallengeJoin} = useChallenge();
    const userId = useAuthContext().session?.user.id;
    const weight = useAuthContext().profile.weight;
    // @ts-ignore
    const exercises: ExerciseDay[] = exerciseDays;

    // State Management
    const [currentIndex, setCurrentIndex] = useState(0);
    const [workoutStatus, setWorkoutStatus] = useState<WorkoutStatus>(WorkoutStatus.IDLE);
    const [phase, setPhase] = useState<WorkoutPhase>('exercise');
    const [timeLeft, setTimeLeft] = useState(0);
    const [completedExercises, setCompletedExercises] = useState<number[]>([]);
    const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lottieRef = useRef<LottieView>(null);
    const workoutStartTime = useRef<Date | null>(null);

    const currentExercise = exercises[currentIndex];
    const isLastExercise = currentIndex === exercises.length - 1;

    useEffect(() => {
        if (currentExercise) {
            if (currentExercise.duration_second > 0) {
                setTimeLeft(currentExercise.duration_second);
            } else {
                setTimeLeft(0);
            }
        }
    }, [currentIndex, currentExercise]);

    const startWorkoutTimer = useCallback(() => {
        if (!workoutStartTime.current) {
            workoutStartTime.current = new Date();
        }

        // @ts-ignore
        timerRef.current = setInterval(() => {
            setTotalWorkoutTime(prev => prev + 1);
        }, 1000);
    }, []);

    const stopWorkoutTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startExerciseTimer = useCallback(() => {
        if (currentExercise.duration_second > 0) {
            //@ts-ignore
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleExerciseComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    }, [currentExercise]);

    const handleExerciseComplete = useCallback(() => {
        stopWorkoutTimer();

        setCompletedExercises(prev => [...prev, currentExercise.id]);

        if (!isLastExercise) {
            setPhase('rest');
            setWorkoutStatus(WorkoutStatus.RESTING);
            setTimeLeft(REST_DURATION);

            //@ts-ignore
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleRestComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            handleWorkoutComplete();
        }
    }, [currentExercise, isLastExercise, stopWorkoutTimer]);

    const handleRestComplete = useCallback(() => {
        stopWorkoutTimer();
        setPhase('exercise');
        setWorkoutStatus(WorkoutStatus.IDLE);

        setCurrentIndex(prev => prev + 1);
    }, [stopWorkoutTimer]);

    const handleSkipRest = useCallback(() => {
        stopWorkoutTimer();
        setPhase('exercise');
        setWorkoutStatus(WorkoutStatus.IDLE);
        setCurrentIndex(prev => prev + 1);
    }, [stopWorkoutTimer]);

    const handleStart = useCallback(() => {
        setWorkoutStatus(WorkoutStatus.ACTIVE);
        startWorkoutTimer();
        startExerciseTimer();

        if (lottieRef.current) {
            lottieRef.current.play();
        }
    }, [startWorkoutTimer, startExerciseTimer]);

    const handleNext = useCallback(() => {
        if (workoutStatus === WorkoutStatus.ACTIVE) {
            // If exercise is active, mark as completed
            handleExerciseComplete();
        } else if (workoutStatus === WorkoutStatus.RESTING) {
            handleSkipRest();
        } else {
            handleStart();
        }
    }, [workoutStatus, handleExerciseComplete, handleSkipRest, handleStart]);

    const handleWorkoutComplete = useCallback(async () => {
        stopWorkoutTimer();
        const calorie = calculateCaloriesFromExercises(exercises.map(value => value.exercise), totalWorkoutTime, weight);
        setWorkoutStatus(WorkoutStatus.COMPLETED);

        setWorkoutCompleted({
            totalExercises: exercises.length,
            totalTime: totalWorkoutTime,
            //@ts-ignore
            avgCalorie:calorie,
            completed_exercise:`${completedExercises.length}/${exercises.length}`
        });

        router.push({
            pathname: '/workout-summary',
        });
    }, [stopWorkoutTimer, completedExercises, exercises, totalWorkoutTime, router]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopWorkoutTimer();
        };
    }, [stopWorkoutTimer]);

    // Format time display
    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Get button text based on state
    const getButtonText = useCallback(() => {
        switch (workoutStatus) {
            case WorkoutStatus.IDLE:
                return 'Start Exercise';
            case WorkoutStatus.ACTIVE:
                return currentExercise.duration_second > 0 ? 'Complete' : 'Complete Reps';
            case WorkoutStatus.RESTING:
                return 'Skip Rest';
            default:
                return 'Next';
        }
    }, [workoutStatus, currentExercise]);

    // Handle back button press
    const handleBackPress = useCallback(() => {
        if (workoutStatus === WorkoutStatus.ACTIVE || workoutStatus === WorkoutStatus.RESTING) {
            Alert.alert(
                'Exit Workout?',
                'Are you sure you want to exit? Your progress will be lost.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Exit',
                        style: 'destructive',
                        onPress: () => router.back()
                    }
                ]
            );
        } else {
            router.back();
        }
    }, [workoutStatus, router]);

    if (!currentExercise) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>No exercises found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    title: `Exercise ${currentIndex + 1}/${exercises.length}`,
                    headerLeft: () => (
                        <TouchableOpacity onPress={handleBackPress}>
                            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                    ),
                }}
            />


            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${((currentIndex + 1) / exercises.length) * 100}%` }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {currentIndex + 1} / {exercises.length}
                </Text>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.exerciseName}>{currentExercise.exercise.name}</Text>

                <View style={styles.animationContainer}>
                    {currentExercise.exercise.image ? (
                        <LottieView
                            ref={lottieRef}
                            source={{ uri: currentExercise.exercise.image }}
                            autoPlay={workoutStatus === WorkoutStatus.ACTIVE}
                            loop={true}
                            style={styles.lottie}
                        />
                    ) : (
                        <View style={styles.placeholderAnimation}>
                            <Ionicons name="fitness" size={100} color={Colors.light.primary} />
                        </View>
                    )}
                </View>

                {/* Exercise Info */}
                <View style={styles.infoContainer}>
                    {currentExercise.reps > 0 && (
                        <View style={styles.infoCard}>
                            <Ionicons name="repeat" size={24} color={Colors.light.primary} />
                            <Text style={styles.infoLabel}>Reps</Text>
                            <Text style={styles.infoValue}>{currentExercise.reps}</Text>
                        </View>
                    )}

                    {currentExercise.duration_second > 0 && workoutStatus === WorkoutStatus.ACTIVE && (
                        <View style={styles.infoCard}>
                            <Ionicons name="timer" size={24} color={Colors.light.primary} />
                            <Text style={styles.infoLabel}>Time</Text>
                            <Text style={styles.infoValue}>{formatTime(timeLeft)}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.musclesContainer}>
                    <Text style={styles.musclesLabel}>Target Muscles:</Text>
                    <View style={styles.muscleTags}>
                        {currentExercise.exercise.otot.split(',').map((muscle, index) => (
                            <View key={index} style={styles.muscleTag}>
                                <Text style={styles.muscleText}>{muscle.trim()}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Rest Timer Component */}
                {phase === 'rest' && workoutStatus === WorkoutStatus.RESTING && (
                    <RestTimer
                        duration={timeLeft}
                        onComplete={handleRestComplete}
                        onSkip={handleSkipRest}
                    />
                )}

                {/* Action Button */}
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        workoutStatus === WorkoutStatus.ACTIVE && styles.activeButton,
                        workoutStatus === WorkoutStatus.RESTING && styles.restButton,
                    ]}
                    onPress={handleNext}
                >
                    <Text style={styles.actionButtonText}>{getButtonText()}</Text>
                    <Ionicons
                        name={
                            workoutStatus === WorkoutStatus.IDLE ? "play" :
                                workoutStatus === WorkoutStatus.ACTIVE ? "checkmark" :
                                    "arrow-forward"
                        }
                        size={24}
                        color={Colors.light.card}
                    />
                </TouchableOpacity>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    {!isLastExercise && workoutStatus === WorkoutStatus.IDLE && (
                        <TouchableOpacity
                            style={styles.quickButton}
                            onPress={() => setCurrentIndex(prev => prev + 1)}
                        >
                            <Ionicons name={"arrow-forward"} size={20} color={Colors.light.textSecondary} />
                            <Text style={styles.quickButtonText}>Skip Exercise</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    progressBar: {
        height: 6,
        backgroundColor: Colors.light.border,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.light.primary,
        borderRadius: 3,
    },
    progressText: {
        textAlign: 'center',
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    exerciseName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 30,
    },
    animationContainer: {
        height: height * 0.3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    placeholderAnimation: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 40,
        marginBottom: 30,
    },
    infoCard: {
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginTop: 8,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    musclesContainer: {
        marginBottom: 30,
    },
    musclesLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 12,
    },
    muscleTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    muscleTag: {
        backgroundColor: Colors.light.primary + '20',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.light.primary + '40',
    },
    muscleText: {
        color: Colors.light.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    actionButton: {
        backgroundColor: Colors.light.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        gap: 12,
        marginBottom: 20,
        shadowColor: Colors.light.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    activeButton: {
        backgroundColor: Colors.light.success,
        shadowColor: Colors.light.success,
    },
    restButton: {
        backgroundColor: Colors.light.warning,
        shadowColor: Colors.light.warning,
    },
    actionButtonText: {
        color: Colors.light.card,
        fontSize: 18,
        fontWeight: 'bold',
    },
    quickActions: {
        alignItems: 'center',
    },
    quickButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    quickButtonText: {
        color: Colors.light.textSecondary,
        fontSize: 14,
    },
});

export default WorkoutPlayerScreen;