// types/workout.ts



// components/RestTimer.tsx
import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface RestTimerProps {
    duration: number;
    onComplete: () => void;
    onSkip: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ duration, onComplete, onSkip }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, onComplete]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="time-outline" size={32} color={Colors.light.warning} />
                <Text style={styles.title}>Rest Time</Text>
            </View>

            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
            <Text style={styles.subtitle}>Get ready for next exercise</Text>

            <View style={styles.tips}>
                <Text style={styles.tipText}>💧 Drink water</Text>
                <Text style={styles.tipText}>🌀 Take deep breaths</Text>
                <Text style={styles.tipText}>✨ Stretch if needed</Text>
            </View>

            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                <Text style={styles.skipText}>Skip Rest</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: Colors.light.warning + '10',
        padding: 24,
        borderRadius: 20,
        marginVertical: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.warning,
        marginLeft: 8,
    },
    timer: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.light.warning,
        marginVertical: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        marginBottom: 24,
    },
    tips: {
        marginBottom: 24,
    },
    tipText: {
        fontSize: 14,
        color: Colors.light.paragraph,
        marginVertical: 4,
    },
    skipButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    skipText: {
        color: Colors.light.textSecondary,
        fontWeight: '500',
    },
});