// components/CustomWorkoutCard.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { CustomWorkout } from '@/types/custom-workout';

interface CustomWorkoutCardProps {
    workout: CustomWorkout;
    onPress: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

const CustomWorkoutCard: React.FC<CustomWorkoutCardProps> = ({
                                                                 workout,
                                                                 onPress,
                                                                 onEdit,
                                                                 onDelete,
                                                             }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'advanced':
                return Colors.light.danger;
            case 'intermediate':
                return Colors.light.warning;
            case 'beginner':
            default:
                return Colors.light.success;
        }
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.cardContent}>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Ionicons
                            name="fitness"
                            size={20}
                            color={Colors.light.primary}
                        />
                        <Text style={styles.title} numberOfLines={1}>
                            {workout.title}
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        {onEdit && (
                            <TouchableWithoutFeedback
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={20}
                                    color={Colors.light.textSecondary}
                                    style={styles.actionIcon}
                                />
                            </TouchableWithoutFeedback>
                        )}
                    </View>
                </View>

                {workout.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {workout.description}
                    </Text>
                )}

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Ionicons
                            name="time-outline"
                            size={16}
                            color={Colors.light.textSecondary}
                        />
                        <Text style={styles.statText}>
                            {workout.duration || '30'} min
                        </Text>
                    </View>

                    <View style={styles.statItem}>
                        <Ionicons
                            name="barbell-outline"
                            size={16}
                            color={Colors.light.textSecondary}
                        />
                        <Text style={styles.statText}>
                            {workout.exercises_count || '8'} exercises
                        </Text>
                    </View>

                    {workout.difficulty && (
                        <View style={[
                            styles.difficultyBadge,
                            { backgroundColor: getDifficultyColor(workout.difficulty) + '20' }
                        ]}>
                            <View style={[
                                styles.difficultyDot,
                                { backgroundColor: getDifficultyColor(workout.difficulty) }
                            ]} />
                            <Text style={[
                                styles.difficultyText,
                                { color: getDifficultyColor(workout.difficulty) }
                            ]}>
                                {workout.difficulty}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <View style={styles.dateContainer}>
                        <Ionicons
                            name="calendar-outline"
                            size={14}
                            color={Colors.light.textSecondary}
                        />
                        <Text style={styles.dateText}>
                            Created {formatDate(workout.created_at)}
                        </Text>
                    </View>

                    {workout.last_completed && (
                        <View style={styles.completionBadge}>
                            <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color={Colors.light.success}
                            />
                            <Text style={styles.completionText}>
                                Completed
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: Colors.light.surface,
    },
    cardContent: {
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionIcon: {
        padding: 4,
    },
    description: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        lineHeight: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontWeight: '500',
    },
    difficultyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    difficultyDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.light.surface,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 12,
        color: Colors.light.textSecondary,
    },
    completionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.light.success + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completionText: {
        fontSize: 12,
        color: Colors.light.success,
        fontWeight: '500',
    },
});

export default CustomWorkoutCard;