// screens/ActivityDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Alert, ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/theme';
import {useLocalSearchParams} from "expo-router/build/hooks";
import { ActivityCard, fetchActivityDetailSimple} from "@/services/load-activity.servise";
import {AntDesign, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import {router} from "expo-router";



const ActivityDetailScreen: React.FC = () => {
    const {id:activityId} = useLocalSearchParams();

    const [activity, setActivity] = useState<ActivityCard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivityDetail();
    }, [activityId]);

    const loadActivityDetail = async () => {
        try {
            setLoading(true);
            //@ts-ignore
            const data = await fetchActivityDetailSimple(activityId);
            setActivity(data);
        } catch (error) {
            console.error('Error loading activity:', error);
            Alert.alert('Error', 'Gagal memuat detail aktivitas');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    };

    const getActivityIcon = () => {
        if (!activity) return 'sports';
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

    const getActivityColor = () => {
        if (!activity) return '#9E9E9E';
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

    if (loading) {
        return <ActivityIndicator />;
    }

    if (!activity) {
        return (
            <View style={styles.centerContainer}>
                <Text>Aktivitas dengan id {activityId} tidak ditemukan</Text>
            </View>
        );
    }

    const { date, time } = formatDateTime(activity.created_at);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {router.back()}}>
                    <AntDesign name="arrow-left" size={24} color={Colors.light.title} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Aktivitas</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.typeContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: getActivityColor() + '20' }]}>
                    <MaterialIcons name={getActivityIcon()} size={32} color={getActivityColor()} />
                </View>
                <Text style={[styles.typeText, { color: getActivityColor() }]}>
                    {activity.type.toUpperCase()}
                </Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{activity.title}</Text>
                <Text style={styles.dateTime}>
                    <MaterialIcons name="calendar-today" size={16} color={Colors.light.paragraph} /> {date}
                </Text>
                <Text style={styles.dateTime}>
                    <MaterialIcons name="access-time" size={16} color={Colors.light.paragraph} /> {time}
                </Text>

                {activity.description && (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionLabel}>Deskripsi:</Text>
                        <Text style={styles.description}>{activity.description}</Text>
                    </View>
                )}

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Statistik</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <MaterialIcons name="local-fire-department" size={24} color="#FF5722" />
                            <Text style={styles.statValue}>{activity.calorie}</Text>
                            <Text style={styles.statLabel}>Kalori</Text>
                        </View>

                        <View style={styles.statCard}>
                            <MaterialIcons name="timer" size={24} color="#2196F3" />
                            <Text style={styles.statValue}>{activity.duration}</Text>
                            <Text style={styles.statLabel}>Menit</Text>
                        </View>
                    </View>
                </View>

                {/* Type-specific Details */}
                {activity.type === 'running' && activity.running_data && (
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Data Lari</Text>
                        <View style={styles.detailGrid}>
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="map-marker" size={20} color="#4CAF50" />
                                <Text style={styles.detailLabel}>Jarak</Text>
                                <Text style={styles.detailValue}>{activity.running_data.distance.toFixed(2)} km</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <MaterialIcons name="speed" size={20} color="#FF9800" />
                                <Text style={styles.detailLabel}>Pace</Text>
                                <Text style={styles.detailValue}>{activity.running_data.pace}/km</Text>
                            </View>
                        </View>
                    </View>
                )}

                {activity.type === 'challenge' && activity.challenge_data && (
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Challenge</Text>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="emoji-events" size={20} color="#FF9800" />
                            <Text style={styles.detailLabel}>Nama Challenge</Text>
                            <Text style={styles.detailValue}>{activity.challenge_data.challenge_title}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="calendar-view-day" size={20} color="#2196F3" />
                            <Text style={styles.detailLabel}>Hari ke</Text>
                            <Text style={styles.detailValue}>{activity.challenge_data.day_number}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                            <Text style={styles.detailLabel}>Latihan Selesai</Text>
                            <Text style={styles.detailValue}>{activity.challenge_data.completed_exercise}</Text>
                        </View>
                    </View>
                )}

                {activity.type === 'custom_workout' && activity.custom_workout_data && (
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Custom Workout</Text>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="fitness-center" size={20} color="#2196F3" />
                            <Text style={styles.detailLabel}>Nama Workout</Text>
                            <Text style={styles.detailValue}>{activity.custom_workout_data.workout_title}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                            <Text style={styles.detailLabel}>Latihan Selesai</Text>
                            <Text style={styles.detailValue}>{activity.custom_workout_data.completed_exercise}</Text>
                        </View>
                    </View>
                )}

                {/* Images Section */}
                {activity.images && activity.images.length > 0 && (
                    <View style={styles.imagesSection}>
                        <Text style={styles.sectionTitle}>Foto Aktivitas</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {activity.images.map((image, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: image }}
                                    style={styles.fullImage}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.title,
    },
    typeContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.title,
        marginBottom: 8,
    },
    dateTime: {
        fontSize: 14,
        color: Colors.light.paragraph,
        marginBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    descriptionContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    descriptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.title,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: Colors.light.paragraph,
        lineHeight: 20,
    },
    statsSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.title,
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statCard: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        minWidth: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.title,
        marginVertical: 8,
    },
    statLabel: {
        fontSize: 14,
        color: Colors.light.paragraph,
    },
    detailSection: {
        marginTop: 20,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
    },
    detailGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: Colors.light.paragraph,
        marginLeft: 12,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.title,
    },
    imagesSection: {
        marginTop: 20,
    },
    fullImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginRight: 12,
    },
});

export default ActivityDetailScreen;