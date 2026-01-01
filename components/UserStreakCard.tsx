// components/UserStreakCard.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Colors } from '@/constants/theme';
import {UserStreak} from "@/types/user-strike";
import {getUserStreak} from "@/services/user-strike.service";
import {useAuthContext} from "@/hooks/use-auth-contex";


interface UserStreakCardProps {
    onPress?: () => void;
    showAnimation?: boolean;
    compact?: boolean;
}

const UserStreakCard: React.FC<UserStreakCardProps> = ({
                                                           onPress,
                                                           showAnimation = true,
                                                           compact = false
                                                       }) => {
    const [streakData, setStreakData] = useState<UserStreak>({
        id: 0,
        user_id: "",
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: "",
        created_at: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFireworks, setShowFireworks] = useState(false);
    const [pulseAnim] = useState(new Animated.Value(1));
    const userId = useAuthContext().session?.user.id

    useEffect(() => {
        if (streakData?.current_streak && streakData.current_streak > 0) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }

        return () => {
            pulseAnim.stopAnimation();
        };
    }, [streakData?.current_streak]);

    // Fetch streak data
    useEffect(() => {
        fetchStreakData();
    }, []);

    const fetchStreakData = async () => {
        try {
            setLoading(true);
            const data = await getUserStreak(userId as string);
            //@ts-ignore
            if(data){
                setStreakData(data);
            }

            //@ts-ignore
            if (data?.current_streak > 0 && data?.last_activity_date === new Date().toISOString().split('T')[0]) {
                setShowFireworks(true);
                setTimeout(() => setShowFireworks(false), 3000);
            }
        } catch (err) {
            //@ts-ignore
            setError(err.message);
            console.error('Error fetching streak:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStreakMessage = () => {
        if (!streakData?.current_streak) return 'Start your fitness journey!';

        const streak = streakData.current_streak;
        if (streak === 0) return 'Start your streak today!';
        if (streak === 1) return 'Great start! Keep going!';
        if (streak < 3) return 'You\'re on fire!';
        if (streak < 7) return 'Building momentum!';
        if (streak < 14) return 'Consistency is key!';
        if (streak < 30) return 'Amazing dedication!';
        if (streak < 90) return 'You\'re unstoppable!';
        return 'Legendary status!';
    };

    const getFlameColor = () => {
        if (!streakData?.current_streak) return Colors.light.textSecondary;

        const streak = streakData.current_streak;
        if (streak === 0) return Colors.light.textSecondary;
        if (streak < 3) return '#FF9500'; // Orange
        if (streak < 7) return '#FF5E3A'; // Red-orange
        if (streak < 30) return '#FF3B30'; // Red
        if (streak < 90) return '#AF52DE'; // Purple
        return '#FFD700'; // Gold
    };

    const renderStreakCounter = () => (
        <Animated.View style={[styles.streakCounter, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons
                name="flame"
                size={compact ? 24 : 32}
                color={getFlameColor()}
                style={styles.flameIcon}
            />
            <Text style={[styles.streakNumber, compact && styles.compactStreakNumber]}>
                {streakData?.current_streak || 0}
            </Text>
        </Animated.View>
    );

    if (loading) {
        return (
            <View style={[styles.card, styles.loadingCard]}>
                <ActivityIndicator size="small" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Loading streak...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <TouchableOpacity style={[styles.card, styles.errorCard]} onPress={fetchStreakData}>
                <Ionicons name="warning" size={24} color={Colors.light.danger} />
                <Text style={styles.errorText}>Failed to load streak</Text>
                <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
        );
    }

    const Content = (
        <View style={[styles.card, compact && styles.compactCard]}>
            {showFireworks && showAnimation && (
                <View style={styles.animationContainer}>
                    <LottieView
                        source={require('../assets/lottie-animation/firework.json')}
                        autoPlay
                        loop={false}
                        style={styles.fireworksAnimation}
                    />
                </View>
            )}

            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Ionicons name="trophy" size={20} color={Colors.light.warning} />
                    <Text style={styles.cardTitle}>Activity Streak</Text>
                </View>
                {!compact && (
                    <TouchableOpacity onPress={fetchStreakData}>
                        <Ionicons name="refresh" size={20} color={Colors.light.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.content}>
                {renderStreakCounter()}
                <Text style={styles.streakMessage}>{getStreakMessage()}</Text>

                {compact && streakData?.current_streak && streakData.current_streak > 0 && (
                    <Text style={styles.compactStreakMessage}>
                        {getStreakMessage()}
                    </Text>
                )}
            </View>


            {/* Streak celebration animation */}
            {showAnimation && streakData?.current_streak && streakData.current_streak >= 3 && (
                <LottieView
                    source={require('../assets/lottie-animation/fire.json')}
                    autoPlay
                    loop
                    style={styles.streakAnimation}
                    speed={0.8}
                />
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
                {Content}
            </TouchableOpacity>
        );
    }

    return Content;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 20,
        padding: 20,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 149, 0, 0.1)',
        overflow: 'hidden',
    },
    compactCard: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    loadingCard: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    errorCard: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        borderColor: Colors.light.danger + '20',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
    },
    content: {
        alignItems: 'center',
    },
    streakCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    flameIcon: {
        marginRight: 8,
    },
    streakNumber: {
        fontSize: 48,
        fontWeight: '800',
        color: Colors.light.text,
    },
    compactStreakNumber: {
        fontSize: 32,
    },
    streakMessage: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 20,
    },
    compactStreakMessage: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        opacity: 0.8,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        backgroundColor: Colors.light.background + '80',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    milestoneContainer: {
        width: '100%',
        marginBottom: 12,
    },
    milestoneText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 8,
        textAlign: 'center',
    },
    progressBar: {
        height: 6,
        backgroundColor: Colors.light.surface,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.light.primary,
        borderRadius: 3,
    },
    lastActivity: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
    footer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    footerText: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        color: Colors.light.danger,
    },
    retryText: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 4,
    },
    animationContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    fireworksAnimation: {
        width: '100%',
        height: '100%',
    },
    streakAnimation: {
        position: 'absolute',
        bottom: -20,
        right: -20,
        width: 150,
        height: 150,
        opacity: 0.3,
    },
});

export default UserStreakCard;