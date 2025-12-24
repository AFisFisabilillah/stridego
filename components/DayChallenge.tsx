import { ChallengeDay } from "@/types/challenge";
import { Feather } from '@expo/vector-icons';
import {StyleSheet, TouchableOpacity, View,Text} from "react-native";

interface DayChallengeProps {
    day: ChallengeDay;
    isActive?: boolean;
    isCompleted?: boolean;
    onPress?: (day: ChallengeDay) => void;
    iconSize?: number;
    textSize?: 'sm' | 'md' | 'lg';
}

export const DayChallenge: React.FC<DayChallengeProps> = ({
                                              day,
                                              isActive = false,
                                              isCompleted = false,
                                              onPress,
                                              iconSize = 24,
                                              textSize = 'md',
                                          }) => {
    const containerStyle = [
        styles.container,
        isActive && styles.activeContainer,
        isCompleted && styles.completedContainer,
    ];

    const getDayIcon = () => {
        if (isCompleted) return 'check-circle';
        if (isActive) return 'play-circle';
        return 'calendar';
    };

    const getDayIconColor = () => {
        if (isCompleted) return '#10B981';
        if (isActive) return '#6366F1';
        return '#6B7280';
    };

    const getTextStyle = () => {
        const baseStyle = styles.title;
        switch (textSize) {
            case 'sm': return [baseStyle, styles.textSm];
            case 'lg': return [baseStyle, styles.textLg];
            default: return [baseStyle, styles.textMd];
        }
    };

    const handlePress = () => {
        if (onPress) {
            onPress(day);
        }
    };

    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={handlePress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={styles.iconContainer}>
                <View style={[
                    styles.iconWrapper,
                    isActive && styles.activeIconWrapper,
                    isCompleted && styles.completedIconWrapper
                ]}>
                    <Feather
                        name={getDayIcon()}
                        size={iconSize}
                        color={getDayIconColor()}
                    />
                </View>
                <Text style={styles.dayNumberText}>
                    {day.day_number}
                </Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.dayLabel}>
                    Hari ke-{day.day_number}
                </Text>
                <Text style={getTextStyle()} numberOfLines={2}>
                    {day.title}
                </Text>
            </View>

            {/* Chevron Icon for active/completed */}
            {(isActive || isCompleted || !isCompleted) && (
                <Feather
                    name="chevron-right"
                    size={20}
                    color="#9CA3AF"
                    style={styles.chevron}
                />
            )}
        </TouchableOpacity>
    );
};

// const parseClassName = (className: string) => {
//
//     return [];
// };

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    activeContainer: {
        backgroundColor: '#EEF2FF',
        borderColor: '#6366F1',
        borderWidth: 1.5,
    },
    completedContainer: {
        backgroundColor: '#F0FDF4',
        borderColor: '#D1FAE5',
    },
    iconContainer: {
        position: 'relative',
        marginRight: 16,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIconWrapper: {
        backgroundColor: '#E0E7FF',
    },
    completedIconWrapper: {
        backgroundColor: '#D1FAE5',
    },
    dayNumberText: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -9 }, { translateY: -9 }],
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    content: {
        flex: 1,
    },
    dayLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 4,
    },
    title: {
        fontWeight: '600',
        color: '#111827',
    },
    textSm: {
        fontSize: 14,
    },
    textMd: {
        fontSize: 16,
    },
    textLg: {
        fontSize: 18,
    },
    chevron: {
        marginLeft: 8,
    },
});