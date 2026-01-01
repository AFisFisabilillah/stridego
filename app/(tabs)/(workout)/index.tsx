import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Image,
    Dimensions
} from "react-native";
import UserStreakCard from "@/components/UserStreakCard";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { ChallengeTemplate } from "@/types/challenge";
import { useImmer } from "use-immer";
import { CustomWorkout } from "@/types/custom-workout";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/hooks/use-auth-contex";
import ChallengeTemplateCard from "@/components/ChallengeTemplateCard";
import { router, useFocusEffect } from "expo-router";
import { Colors } from "@/constants/theme";
import {AntDesign, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import CustomWorkoutCard from "@/components/CustomWorkoutCard";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get('window');

const WorkoutScreen = () => {
    const [challenges, setChallenges] = useImmer<ChallengeTemplate[]>([]);
    const [workouts, setWorkouts] = useImmer<CustomWorkout[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<'challenges' | 'workouts'>('challenges');
    const userId = useAuthContext().session?.user.id;

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchChallenge(),
                fetchCustomWorkout()
            ]);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllData();
    };

    async function fetchChallenge() {
        try {
            const { data } = await supabase
                .from("challange_templates")
                .select("*")
                .order('created_at', { ascending: false });
            setChallenges(data || []);
        } catch (e) {
            console.log(e);
        }
    }

    async function fetchCustomWorkout() {
        try {
            const { data } = await supabase
                .from("custom_workouts")
                .select("*")
                .eq("user_id", userId)
                .order('created_at', { ascending: false });

            setWorkouts(data || []);
        } catch (e) {
            console.log(e);
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchAllData();
        }, [])
    );

    const renderEmptyWorkouts = () => (
        <TouchableOpacity
            style={styles.emptyWorkoutCard}
            onPress={() => router.push("/(custom-workout)/create-custom-workout")}
            activeOpacity={0.8}
        >
            <View style={styles.emptyWorkoutContent}>
                <View style={styles.emptyIconContainer}>
                    <Ionicons
                        name="add-circle-outline"
                        size={48}
                        color={Colors.light.primary}
                    />
                    <View style={styles.dashedBorder}>
                        <MaterialCommunityIcons
                            name="dumbbell"
                            size={32}
                            color={Colors.light.primary + '80'}
                        />
                    </View>
                </View>
                <Text style={styles.emptyTitle}>No Workouts Yet</Text>
                <Text style={styles.emptyDescription}>
                    Create your first custom workout to start training
                </Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push("/(custom-workout)/create-custom-workout")}
                >
                    <Ionicons name="add" size={20} color={Colors.light.background} />
                    <Text style={styles.createButtonText}>Create Workout</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderWorkoutItem = ({ item }: { item: CustomWorkout }) => (
        <CustomWorkoutCard
            workout={item}
            onPress={() => router.push(`/(custom-workout)/${item.id}`)}
            onEdit={() => router.push(`/(custom-workout)/(edit)/${item.id}`)}
        />
    );

    const renderChallengeItem = ({ item }: { item: ChallengeTemplate }) => (
        <ChallengeTemplateCard
            userProgress={0}
            challenge={item}
            onPress={() => router.push(`/(workout)/${item.id}`)}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.light.primary]}
                        tintColor={Colors.light.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Stridego</Text>
                        <Text style={styles.headerSubtitle}>
                            Track your progress and challenges
                        </Text>
                    </View>

                </View>

                {/* Streak Card */}
                <View style={styles.streakSection}>
                    <UserStreakCard
                        compact={true}
                        showAnimation={true}
                    />
                </View>

                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'challenges' && styles.activeTabButton
                        ]}
                        onPress={() => setSelectedTab('challenges')}
                    >
                        <Ionicons
                            name="trophy"
                            size={20}
                            color={selectedTab === 'challenges' ? Colors.light.background : Colors.light.textSecondary}
                        />
                        <Text style={[
                            styles.tabText,
                            selectedTab === 'challenges' && styles.activeTabText
                        ]}>
                            Challenges
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'workouts' && styles.activeTabButton
                        ]}
                        onPress={() => setSelectedTab('workouts')}
                    >
                        <MaterialCommunityIcons
                            name="dumbbell"
                            size={20}
                            color={selectedTab === 'workouts' ? Colors.light.background : Colors.light.textSecondary}
                        />
                        <Text style={[
                            styles.tabText,
                            selectedTab === 'workouts' && styles.activeTabText
                        ]}>
                            My Workouts
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {selectedTab === 'challenges' ? (
                        <>
                            <View style={styles.sectionHeader}>
                                <TouchableOpacity style={{flexDirection:"row", alignItems:"center"}} onPress={()=>{router.push("/(workout)/workout")}}>
                                    <Text style={styles.sectionTitle}>Challenges</Text>
                                    <AntDesign name="arrow-right" size={24} color={Colors.light.primary} />
                                </TouchableOpacity>
                                <Text style={styles.sectionCount}>{challenges.length} available</Text>
                            </View>

                            {challenges.length === 0 ? (
                                <View style={styles.emptyState}>

                                    <Text style={styles.emptyStateTitle}>No Challenges Available</Text>
                                    <Text style={styles.emptyStateText}>
                                        Check back later for new challenges
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={challenges}
                                    renderItem={renderChallengeItem}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.listContainer}
                                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionHeader}>
                                    <TouchableOpacity style={{flexDirection:"row", alignItems:"center"}} onPress={()=>{router.push("/(custom-workout)")}}>
                                        <Text style={styles.sectionTitle}>MY Workout</Text>
                                        <AntDesign name="arrow-right" size={24} color={Colors.light.primary} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.sectionCount}>{workouts.length} created</Text>
                            </View>

                            {workouts.length === 0 ? (
                                renderEmptyWorkouts()
                            ) : (
                                <FlatList
                                    data={workouts}
                                    renderItem={renderWorkoutItem}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.listContainer}
                                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                                />
                            )}
                        </>
                    )}
                </View>

                <View style={styles.quickActions}>
                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => router.push("/(custom-workout)/create-custom-workout")}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: Colors.light.primary + '20' }]}>
                                <Ionicons name="add" size={24} color={Colors.light.primary} />
                            </View>
                            <Text style={styles.quickActionText}>Create Workout</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => router.push("/(custom-workout)")}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: Colors.light.warning + '20' }]}>
                                <Ionicons name="flame" size={24} color={Colors.light.warning} />
                            </View>
                            <Text style={styles.quickActionText}>Workout</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => router.push("/(workout)/workout")}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: Colors.light.success + '20' }]}>
                                <MaterialCommunityIcons name="trophy-outline" size={24} color={Colors.light.primary} />
                            </View>
                            <Text style={styles.quickActionText}>Challenge</Text>
                        </TouchableOpacity>
                    </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.light.text,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        opacity: 0.8,
    },
    headerButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.light.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.light.primary + '30',
    },
    streakSection: {
        paddingHorizontal: 20,
        marginVertical: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.light.surface,
        marginHorizontal: 20,
        marginBottom: 24,
        borderRadius: 16,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    activeTabButton: {
        backgroundColor: Colors.light.primary,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.textSecondary,
    },
    activeTabText: {
        color: Colors.light.background,
    },
    content: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
        textDecorationLine:"underline"
    },
    sectionCount: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        backgroundColor: Colors.light.surface,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    listContainer: {
        paddingBottom: 20,
    },
    separator: {
        height: 16,
    },
    emptyWorkoutCard: {
        backgroundColor: Colors.light.card,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.light.primary,
        marginVertical: 8,
    },
    emptyWorkoutContent: {
        alignItems: 'center',
    },
    emptyIconContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    dashedBorder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.primary + '08',
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    createButtonText: {
        color: Colors.light.background,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyAnimation: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
    quickActions: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    quickActionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionButton: {
        width: (width - 52) / 2,
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        textAlign: 'center',
    },
});

export default WorkoutScreen;