// components/ActivityCard.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
} from 'react-native';
import { ActivityCard as ActivityCardType } from '@/services/load-activity.servise';
import { Colors } from '@/constants/theme';
import {MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";

interface ActivityCardProps {
    activity: ActivityCardType;
    onPress?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
    const getIconName = () => {
        switch (activity.type) {
            case 'running':
                return 'directions-run';
            case 'challenge':
                return 'emoji-events';
            case 'custom_workout':
                return 'fitness-center';
            default:
                return 'sports';
        }
    };

    const getTypeColor = () => {
        switch (activity.type) {
            case 'running':
                return '#4CAF50';
            case 'challenge':
                return '#FF9800';
            case 'custom_workout':
                return '#2196F3';
            default:
                return '#9E9E9E';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        }

        return `${mins}:${String(secs).padStart(2, "0")}`;
    };


    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: getTypeColor() + '20' }]}>
                    <MaterialIcons name={getIconName()} size={24} color={getTypeColor()} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title} numberOfLines={1}>
                        {activity.title}
                    </Text>
                    <Text style={styles.date}>{formatDate(activity.created_at)}</Text>
                </View>
                <View style={styles.typeBadge}>
                    <Text style={[styles.typeText, { color: getTypeColor() }]}>
                        {activity.type.toUpperCase()}
                    </Text>
                </View>
            </View>

            {/* Description */}
            {activity.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {activity.description}
                </Text>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <MaterialIcons name="local-fire-department" size={20} color="#FF5722" />
                    <Text style={styles.statValue}>{activity.calorie}</Text>
                    <Text style={styles.statLabel}>kalori</Text>
                </View>

                <View style={styles.statItem}>
                    <MaterialIcons name="timer" size={20} color="#2196F3" />
                    <Text style={styles.statValue}>{formatTime(activity.duration)}</Text>
                    <Text style={styles.statLabel}>durasi</Text>
                </View>

                {/* Type-specific stats */}
                {activity.type === 'running' && activity.running_data && (
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="map-marker-distance" size={20} color="#4CAF50" />
                        <Text style={styles.statValue}>{activity.running_data.distance.toFixed(1)}</Text>
                        <Text style={styles.statLabel}>km</Text>
                    </View>
                )}

                {(activity.type === 'challenge' || activity.type === 'custom_workout') && (
                    <View style={styles.statItem}>
                        <MaterialIcons name="check-circle" size={20} color="#FF9800" />
                        <Text style={styles.statValue}>
                            {activity.type === 'challenge'
                                ? activity.challenge_data?.completed_exercise || '0/0'
                                : activity.custom_workout_data?.completed_exercise || '0/0'
                            }
                        </Text>
                        <Text style={styles.statLabel}>selesai</Text>
                    </View>
                )}
            </View>

            {/* Images Preview */}
            {activity.images && activity.images.length > 0 && (
                <View style={styles.imagesContainer}>
                    {activity.images.slice(0, 3).map((image:any, index:any) => (
                        <Image
                            key={index}
                            source={{ uri: image }}
                            style={styles.previewImage}
                            resizeMode="cover"
                        />
                    ))}
                    {activity.images.length > 3 && (
                        <View style={styles.moreImages}>
                            <Text style={styles.moreText}>+{activity.images.length - 3}</Text>
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.gray,
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: Colors.light.paragraph,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#f5f5f5',
    },
    typeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: Colors.light.paragraph,
        marginBottom: 12,
        lineHeight: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.primary,
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.paragraph,
        marginTop: 2,
    },
    imagesContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    previewImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 8,
    },
    moreImages: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.paragraph,
    },
});

export default ActivityCard;