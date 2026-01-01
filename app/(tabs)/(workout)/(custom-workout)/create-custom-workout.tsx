// screens/CustomWorkoutScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import ExerciseSelectionModal from '@/components/ExerciseSelectionModal';
import ExerciseList from '@/components/ExerciseList';
import {useAuthContext} from "@/hooks/use-auth-contex";
import {Exercise} from "@/types/challenge";
import {CustomWorkoutExercise} from "@/types/custom-workout";
import {createCustomWorkout, createCustomWorkoutExercise, getAllExercises} from "@/services/custom-workout.service";





const CustomWorkoutScreen: React.FC = () => {
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [exercises, setExercises] = useState<CustomWorkoutExercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const userId=useAuthContext().session?.user.id;

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
           const data = await getAllExercises();
           //@ts-ignore
            setAvailableExercises(data || []);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            Alert.alert('Error', 'Failed to load exercises');
        }
    };

    const handleSelectExercises = (selectedExerciseIds: string[]) => {
        const newExercises = selectedExerciseIds
            .filter(id => !exercises.find(e => e.exercise_id === id))
            .map((id, index) => {
                //@ts-ignore
                const exercise = availableExercises.find(e => e.id === id);
                return {
                    exercise_id: id,
                    reps: null,
                    duration_second: null,
                    order_index: exercises.length + index,
                    exercise: exercise,
                };
            });

        setExercises([...exercises, ...newExercises]);
        setModalVisible(false);
    };

    const updateExerciseField = (index: number, field:string, value: any) => {
        const updatedExercises = [...exercises];
        updatedExercises[index] = {
            ...updatedExercises[index],
            [field]: value,
        };
        setExercises(updatedExercises);
    };

    const removeExercise = (index: number) => {
        const updatedExercises = exercises.filter(( _, i) => i !== index);
        const reorderedExercises = updatedExercises.map((exercise, idx) => ({
            ...exercise,
            order_index: idx,
        }));
        setExercises(reorderedExercises);
    };

    const moveExercise = (fromIndex: number, toIndex: number) => {
        const updatedExercises = [...exercises];
        const [movedExercise] = updatedExercises.splice(fromIndex, 1);
        updatedExercises.splice(toIndex, 0, movedExercise);

        const reorderedExercises = updatedExercises.map((exercise, idx) => ({
            ...exercise,
            order_index: idx,
        }));

        setExercises(reorderedExercises);
    };

    const calculateEstimatedCalories = (): number => {
        let totalCalories = 0;

        exercises.forEach((item) => {
            if (item.exercise && item.duration_second) {
                const metValue = item.exercise.met;
                const minutes = item.duration_second / 60;
                const calories = (metValue * 3.5 * 70 * minutes) / 200;
                totalCalories += calories;
            }
        });

        return Math.round(totalCalories);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Please enter a workout title');
            return;
        }

        if (exercises.length === 0) {
            Alert.alert('Validation Error', 'Please add at least one exercise');
            return;
        }

        setLoading(true);

        try {
            const workoutData = await createCustomWorkout(title,description,userId as string);


            await createCustomWorkoutExercise(exercises, workoutData);

            Alert.alert(
                'Success',
                'Custom workout saved successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error saving custom workout:', error);
            Alert.alert('Error', error.message || 'Failed to save workout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Create Custom Workout</Text>
                    <Text style={styles.subtitle}>
                        Create your personalized workout routine
                    </Text>
                </View>

                {/* Workout Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Workout Details</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter workout title"
                            placeholderTextColor={Colors.light.gray}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter workout description (optional)"
                            placeholderTextColor={Colors.light.gray}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                {/* Exercises Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Exercises</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={styles.addButtonText}>+ Add Exercise</Text>
                        </TouchableOpacity>
                    </View>

                    {exercises.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                No exercises added yet. Tap `&quot; Add Exercise `&rdquo; to get started.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <ExerciseList
                                exercises={exercises}
                                onUpdateField={updateExerciseField}
                                onRemove={removeExercise}
                                onMove={moveExercise}
                            />

                            {/* Estimated Calories */}
                            {exercises.some(e => e.duration_second) && (
                                <View style={styles.calorieEstimate}>
                                    <Text style={styles.calorieLabel}>Estimated Calories Burned:</Text>
                                    <Text style={styles.calorieValue}>
                                        {calculateEstimatedCalories()} kcal
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Footer with Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (!title.trim() || exercises.length === 0 || loading) && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!title.trim() || exercises.length === 0 || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.light.background} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Workout</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Exercise Selection Modal */}
            <ExerciseSelectionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={handleSelectExercises}
                availableExercises={availableExercises}
                selectedExerciseIds={exercises.map(e => e.exercise_id)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 20,
        backgroundColor: Colors.light.primary,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.background,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.background + '80',
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.light.gray,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: Colors.light.text,
        backgroundColor: Colors.light.background,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    addButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: Colors.light.background,
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        backgroundColor: Colors.light.background + '20',
        padding: 24,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        color: Colors.light.gray,
        textAlign: 'center',
        fontSize: 14,
    },
    calorieEstimate: {
        marginTop: 20,
        padding: 16,
        backgroundColor: Colors.light.primary + '10',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    calorieLabel: {
        fontSize: 14,
        color: Colors.light.text,
    },
    calorieValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.primary,
    },
    footer: {
        padding: 20,
        backgroundColor: Colors.light.background,
        borderTopWidth: 1,
        borderTopColor: Colors.light.gray + '30',
    },
    saveButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: Colors.light.gray,
        opacity: 0.6,
    },
    saveButtonText: {
        color: Colors.light.background,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomWorkoutScreen;