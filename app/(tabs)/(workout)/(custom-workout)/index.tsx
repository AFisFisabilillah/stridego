// screens/CustomWorkoutListScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import {router} from "expo-router";
import {CustomWorkout} from "@/types/custom-workout";
import {useAuthContext} from "@/hooks/use-auth-contex";
import {getAllCustomWorkouts} from "@/services/custom-workout.service";



const CustomWorkoutListScreen: React.FC = () => {
    const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const userId= useAuthContext().session?.user.id;

    useEffect(() => {
        fetchCustomWorkouts();
    }, []);

    const fetchCustomWorkouts = async () => {
        try {

            //@ts-ignore
            const workoutsData =await getAllCustomWorkouts(userId);
            const workoutsWithCount = await Promise.all(
                (workoutsData || []).map(async (workout) => {
                    const { count, error: countError } = await supabase
                        .from('custom_workout_exercises')
                        .select('*', { count: 'exact', head: true })
                        //@ts-ignore
                        .eq('custom_workout_id', workout.id);

                    if (countError) {
                        console.error('Error counting exercises:', countError);
                    }

                    return {
                        //@ts-ignore
                        ...workout,
                        exercise_count: count || 0,
                    };
                })
            );

            setWorkouts(workoutsWithCount);
        } catch (error: any) {
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to load custom workouts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCustomWorkouts();
    };

    const handleCreateNew = () => {
        router.push("/create-custom-workout")
    };

    const handleWorkoutPress = (workoutId: string) => {
        router.push({
            //@ts-ignore
            pathname:`/${workoutId}`
        })
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Loading workouts...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Custom Workouts</Text>
                <Text style={styles.headerSubtitle}>
                    Create and manage your personalized workouts
                </Text>
            </View>

            {/* Create New Button */}
            <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
                <Ionicons name="add-circle" size={24} color={Colors.light.primary} />
                <Text style={styles.createButtonText}>Create New Workout</Text>
            </TouchableOpacity>

            {/* Workouts List */}
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={[
                    styles.scrollContent,
                    workouts.length === 0 && styles.emptyScrollContent,
                ]}
            >
                {workouts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="fitness-outline"
                            size={80}
                            color={Colors.light.gray}
                        />
                        <Text style={styles.emptyTitle}>No Custom Workouts Yet</Text>
                        <Text style={styles.emptyDescription}>
                            Create your first custom workout to get started!
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={handleCreateNew}
                        >
                            <Text style={styles.emptyButtonText}>Create Workout</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    workouts.map((workout) => (
                        <TouchableOpacity
                            key={workout.id}
                            style={styles.workoutCard}
                            onPress={() => handleWorkoutPress(workout.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.workoutCardHeader}>
                                <View style={styles.workoutTitleContainer}>
                                    <Text style={styles.workoutTitle} numberOfLines={1}>
                                        {workout.title}
                                    </Text>
                                    <View style={styles.exerciseCountBadge}>
                                        <Ionicons
                                            name="barbell-outline"
                                            size={12}
                                            color={Colors.light.background}
                                        />
                                        <Text style={styles.exerciseCountText}>
                                            {workout.exercise_count}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={Colors.light.gray}
                                />
                            </View>

                            {workout.description && (
                                <Text style={styles.workoutDescription} numberOfLines={2}>
                                    {workout.description}
                                </Text>
                            )}

                            <View style={styles.workoutFooter}>
                                <View style={styles.dateContainer}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={14}
                                        color={Colors.light.gray}
                                    />
                                    <Text style={styles.dateText}>
                                        {formatDate(workout.created_at)}
                                    </Text>
                                </View>

                                <View style={styles.actionsContainer}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleWorkoutPress(workout.id)}
                                    >
                                        <Text style={styles.actionButtonText}>View</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
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
    header: {
        padding: 20,
        paddingBottom: 12,
        backgroundColor: Colors.light.primary,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.background,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.light.background + '80',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        borderStyle: 'dashed',
    },
    createButtonText: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    emptyScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        color: Colors.light.gray,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    emptyButtonText: {
        color: Colors.light.background,
        fontSize: 14,
        fontWeight: '600',
    },
    workoutCard: {
        backgroundColor: Colors.light.background,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.gray + '30',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    workoutCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    workoutTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    workoutTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        flex: 1,
    },
    exerciseCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    exerciseCountText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.background,
        marginLeft: 4,
    },
    workoutDescription: {
        fontSize: 14,
        color: Colors.light.gray,
        lineHeight: 20,
        marginBottom: 16,
    },
    workoutFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: Colors.light.gray,
        marginLeft: 6,
    },
    actionsContainer: {
        flexDirection: 'row',
    },
    actionButton: {
        backgroundColor: Colors.light.primary + '10',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.primary,
    },
});

export default CustomWorkoutListScreen;