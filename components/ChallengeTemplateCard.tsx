// components/challenge/ChallengeTemplateCard.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from "@/constants/theme";
import { ChallengeTemplate } from "@/types/challenge";

interface ChallengeTemplateCardProps {
    challenge: ChallengeTemplate;
    onPress: (challenge: ChallengeTemplate) => void;
    userProgress?: number; // 0-100
    isJoined?: boolean;
}

const { width } = Dimensions.get('window');

const ChallengeTemplateCard: React.FC<ChallengeTemplateCardProps> = ({
                                                                         challenge,
                                                                         onPress,
                                                                         userProgress = 0,
                                                                         isJoined = false,
                                                                     }) => {
    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return Colors.light.success;
            case 'intermediate':
                return Colors.light.warning;
            case 'advanced':
                return Colors.light.danger;
            default:
                return Colors.light.primary;
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return 'fire';
            case 'intermediate':
                return 'fire';
            case 'advanced':
                return 'fire';
            default:
                return 'flag';
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(challenge)}
            activeOpacity={0.9}>
            <View style={styles.imageContainer}>
                {challenge.cover_image_url ? (
                    <Image
                        source={{ uri: challenge.cover_image_url }}
                        style={styles.coverImage}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
                        style={styles.coverImage}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                )}

                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradientOverlay}
                />

                {/* Level Badge */}
                <View style={[styles.levelBadge, { backgroundColor: getLevelColor(challenge.level) }]}>
                    <MaterialCommunityIcons
                        name={getLevelIcon(challenge.level)}
                        size={14}
                        color="#FFFFFF"
                    />
                    <Text style={styles.levelText}>
                        {challenge.level.charAt(0).toUpperCase() + challenge.level.slice(1)}
                    </Text>
                </View>

                {/* Progress Indicator if joined */}
                {isJoined && userProgress > 0 && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${userProgress}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>{Math.round(userProgress)}%</Text>
                    </View>
                )}

                {/* Join Badge */}
                {isJoined && (
                    <View style={styles.joinBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.joinText}>Joined</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {challenge.title}
                    </Text>
                    <View style={styles.durationBadge}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.light.primary} />
                        <Text style={styles.durationText}>
                            {challenge.duration_days} days
                        </Text>
                    </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {challenge.description || 'No description available'}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.stats}>
                        <View style={styles.statItem}>
                            <Ionicons name="flame-outline" size={16} color={Colors.light.textSecondary} />
                            <Text style={styles.statText}>Daily</Text>
                        </View>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="progress-clock" size={16} color={Colors.light.textSecondary} />
                            <Text style={styles.statText}>30-45 min</Text>
                        </View>
                    </View>

                    <View style={styles.actionButton}>
                        <Ionicons
                            name={isJoined ? "play-circle" : "arrow-forward-circle"}
                            size={24}
                            color={Colors.light.primary}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 160,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
    },
    levelBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    levelText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter-Medium',
    },
    progressContainer: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.light.primary,
        borderRadius: 3,
    },
    progressText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        minWidth: 30,
        fontFamily: 'Inter-SemiBold',
    },
    joinBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.secondary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    joinText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter-Medium',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        fontFamily: 'Inter-Bold',
        marginRight: 8,
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    durationText: {
        fontSize: 12,
        color: Colors.light.primary,
        fontWeight: '600',
        fontFamily: 'Inter-Medium',
    },
    description: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        lineHeight: 20,
        marginBottom: 16,
        fontFamily: 'Inter-Regular',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stats: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: Colors.light.textSecondary,
        fontFamily: 'Inter-Medium',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChallengeTemplateCard;