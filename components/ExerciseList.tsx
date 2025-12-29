// components/ExerciseList.tsx
import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import LottieView from "lottie-react-native";

interface CustomWorkoutExercise {
    id?: number;
    exercise_id: string;
    reps: number | null;
    duration_second: number | null;
    order_index: number;
    exercise?: {
        name: string;
        otot?: string;
        image: string;
    };
}

interface ExerciseListProps {
    exercises: CustomWorkoutExercise[];
    onUpdateField: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
    onMove: (fromIndex: number, toIndex: number) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
                                                       exercises,
                                                       onUpdateField,
                                                       onRemove,
                                                       onMove,
                                                   }) => {
    return (
        <>
            {exercises.map((exercise, index) => (
                <View key={`${exercise.exercise_id}-${index}`} style={styles.exerciseCard}>
                    {/* Header with Exercise Info and Remove Button */}
                    <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseInfo}>
                            <View style={styles.lottieContainer}>
                                <LottieView
                                    source={{uri:exercise.exercise?.image}}
                                    autoPlay
                                    loop
                                    style={{ width: 50, height: 50 }}
                                />
                            </View>
                            <View style={styles.exerciseNumber}>
                                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                            </View>
                            <View style={styles.exerciseTextInfo}>
                                <Text style={styles.exerciseName}>
                                    {exercise.exercise?.name || 'Exercise'}
                                </Text>
                                {exercise.exercise?.otot && (
                                    <Text style={styles.exerciseMuscle}>
                                        {exercise.exercise.otot}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => onRemove(index)}
                        >
                            <Ionicons name="trash-outline" size={20} color={Colors.light.danger} />
                        </TouchableOpacity>
                    </View>

                    {/* Input Fields for Reps and Duration */}
                    <View style={styles.inputRow}>
                        {/* Reps Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Reps</Text>
                            <TextInput
                                style={styles.input}
                                value={exercise.reps?.toString() }
                                onChangeText={(value) => {
                                    const numValue = value === '' ? null : parseInt(value);
                                    onUpdateField(index, 'reps', numValue);
                                }}
                                placeholder="Optional"
                                placeholderTextColor={Colors.light.gray}
                                keyboardType="numeric"
                            />
                        </View>

                        <Text style={styles.orText}>or</Text>

                        {/* Duration Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Duration (seconds)</Text>
                            <TextInput
                                style={styles.input}
                                value={exercise.duration_second?.toString()}
                                onChangeText={(value) => {
                                    const numValue = value === '' ? null : parseInt(value);
                                    onUpdateField(index, 'duration_second', numValue);
                                   
                                }}
                                placeholder="Optional"
                                placeholderTextColor={Colors.light.gray}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Move Buttons */}
                    <View style={styles.moveButtons}>
                        <TouchableOpacity
                            style={[
                                styles.moveButton,
                                index === 0 && styles.moveButtonDisabled,
                            ]}
                            onPress={() => onMove(index, index - 1)}
                            disabled={index === 0}
                        >
                            <Ionicons
                                name="arrow-up-outline"
                                size={20}
                                color={index === 0 ? Colors.light.gray : Colors.light.primary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.moveButton,
                                index === exercises.length - 1 && styles.moveButtonDisabled,
                            ]}
                            onPress={() => onMove(index, index + 1)}
                            disabled={index === exercises.length - 1}
                        >
                            <Ionicons
                                name="arrow-down-outline"
                                size={20}
                                color={
                                    index === exercises.length - 1
                                        ? Colors.light.gray
                                        : Colors.light.primary
                                }
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    exerciseCard: {
        backgroundColor: Colors.light.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.gray + '30',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    exerciseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
    exerciseTextInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 4,
    },
    exerciseMuscle: {
        fontSize: 14,
        color: Colors.light.primary,
        fontWeight: '500',
    },
    removeButton: {
        padding: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    inputGroup: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: Colors.light.gray,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.light.gray,
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        color: Colors.light.text,
        backgroundColor: Colors.light.background,
    },
    orText: {
        fontSize: 14,
        color: Colors.light.gray,
        marginHorizontal: 12,
        marginBottom: 14,
    },
    moveButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    moveButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.background + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        borderWidth: 1,
        borderColor: Colors.light.gray + '30',
    },
    moveButtonDisabled: {
        opacity: 0.4,
    },
    lottieContainer: {
        marginRight: 12,
    }
});

export default ExerciseList;