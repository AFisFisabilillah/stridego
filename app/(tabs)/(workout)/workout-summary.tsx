// screens/WorkoutSummaryScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter,Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import {SafeAreaView} from "react-native-safe-area-context";
import {useChallenge} from "@/providers/challenge-provider";

const WorkoutSummaryScreen: React.FC = () => {
    const router = useRouter();
    const {workoutCompleted} = useChallenge();

    const completedCount = Number(workoutCompleted?.completedCount) || 0;
    const totalExercises = Number(workoutCompleted?.totalExercises) || 0;
    const totalTime = Number(workoutCompleted?.totalTime) || 0;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const completionRate = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Workout Complete!', headerShown: false }} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Celebration */}
                <View style={styles.celebration}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="trophy" size={80} color={Colors.light.warning} />
                    </View>
                    <Text style={styles.title}>Workout Complete!</Text>
                    <Text style={styles.subtitle}>Great job completing your workout</Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="checkmark-circle" size={32} color={Colors.light.success} />
                        <Text style={styles.statNumber}>{completedCount}/{totalExercises}</Text>
                        <Text style={styles.statLabel}>Exercises</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="time" size={32} color={Colors.light.primary} />
                        <Text style={styles.statNumber}>{formatTime(totalTime)}</Text>
                        <Text style={styles.statLabel}>Total Time</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="trending-up" size={32} color={Colors.light.success} />
                        <Text style={styles.statNumber}>{Math.round(completionRate)}%</Text>
                        <Text style={styles.statLabel}>Completion</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={() => router.replace('/')}
                    >
                        <Ionicons name="home" size={24} color={Colors.light.card} />
                        <Text style={styles.buttonText}>Back to Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="repeat" size={24} color={Colors.light.primary} />
                        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Do Again</Text>
                    </TouchableOpacity>
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
    content: {
        padding: 20,
        alignItems: 'center',
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
});

export default WorkoutSummaryScreen;