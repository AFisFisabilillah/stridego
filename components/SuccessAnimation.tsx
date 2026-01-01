// components/SuccessAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuccessAnimationProps {
    message?: string;
    onAnimationComplete?: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
                                                               message = 'Berhasil!',
                                                               onAnimationComplete
                                                           }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onAnimationComplete?.();
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.overlay}>
            <Animated.View style={[
                styles.container,
                {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                }
            ]}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                </View>
                <Text style={styles.message}>{message}</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '80%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    iconContainer: {
        marginBottom: 20,
    },
    message: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
});

export default SuccessAnimation;