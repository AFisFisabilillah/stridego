import {useLocalSearchParams} from "expo-router/build/hooks";
import {SafeAreaView} from "react-native-safe-area-context";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    FlatList
} from "react-native";
import {Image} from "expo-image";
import {useImmer} from "use-immer";
import {ChallengeDay, ChallengeTemplate} from "@/types/challenge";
import {
    getChallengeDayComplete,
    getDetailChallenge,
    isUserJoinChallenge,
    joinChallenge
} from "@/services/challange.service";
import {useEffect, useState} from "react";
import {LinearGradient} from "expo-linear-gradient";
import {Feather, MaterialCommunityIcons, FontAwesome5} from "@expo/vector-icons";
import {ButtonOutline} from "@/components/ButtonOutline";
import {Colors} from "@/constants/theme";
import {DayChallenge} from "@/components/DayChallenge";
import {router} from "expo-router";
import {useChallenge} from "@/providers/challenge-provider";
import {useAuthContext} from "@/hooks/use-auth-contex";
import Button from "@/components/Button";
import SuccessModal from "@/components/SuccessModal";

const {width} = Dimensions.get('window');

export default function DetailChallenge() {
    const idUser = useAuthContext().session?.user.id;
    const {setChallenge, challenge, setChallengeDay, setIdChallengeJoin, idChallengeJoin} = useChallenge();
    const {idChallenge} = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [challengeDays, setChallengeDays] = useImmer<ChallengeDay[]>([]);
    const [loadingJoin, setLoadingJoin] = useState<boolean>(false);
    const [join, setJoin] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [dayComplete, setDayComplete] = useState<number[]>([]);

    const fetchChallenge = async (idChallenge: string) => {
        try {
            setLoading(true);
            const data = await getDetailChallenge(idChallenge);
            //@ts-ignore
            setChallenge(data);
            //@ts-ignore
            setChallengeDays(data["challenge_days"]);
            //@ts-ignore
            console.log("challenge day : ", data["challenge_days"]);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const fetchChallengeDayComplete = async (idChallenge: string) => {
        if (idChallenge) {
            setLoading(true);
            //@ts-ignore
            const data = await getChallengeDayComplete(idChallengeJoin, idChallenge)
            setDayComplete(data);
            setLoading(false);
        }
    }
    const checkUserJoin = async (idUser: string, idChallenge: string) => {
        const {id, isJoin} = await isUserJoinChallenge(idUser, idChallenge);
        setJoin(isJoin);
        setLoading(true);
        //@ts-ignore
        if(id){
            setIdChallengeJoin(id.id);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchChallengeDayComplete(idChallenge as string);
        fetchChallenge(idChallenge as string);
        if(idUser){
            checkUserJoin(idUser, idChallenge);
        }
    }, [idChallenge]);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'beginner':
                return '#10B981';
            case 'intermediate':
                return '#F59E0B';
            case 'advanced':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'beginner':
                return 'seedling';
            case 'intermediate':
                return 'chart-line';
            case 'advanced':
                return 'fire';
            default:
                return 'star';
        }
    };

    if (loading || !challenge) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1"/>
            </SafeAreaView>
        );
    }

    async function handleJoinChallenge() {
        //@ts-ignore
        setLoadingJoin(true);
        try {
            //@ts-ignore
            const data = await joinChallenge(idChallenge, idUser);
            console.log("joinChallenge", data);
            if (data) {
                setModal(true);
                //@ts-ignore
                setIdChallengeJoin(data.id);
                setJoin(true);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingJoin(false);
        }

    }

    // @ts-ignore
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.heroContainer}>
                <Image
                    style={styles.heroImage}
                    source={{uri: challenge.cover_image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'}}
                    transition={300}
                    contentFit="cover"
                />

                <LinearGradient
                    colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.8)']}
                    locations={[0, 0.5, 1]}
                    style={styles.heroGradient}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.levelBadge}>
                            <FontAwesome5
                                name={getLevelIcon(challenge.level)}
                                size={12}
                                color="white"
                            />
                            <Text style={[styles.levelText, {color: getLevelColor(challenge.level)}]}>
                                {challenge.level.toUpperCase()}
                            </Text>
                        </View>

                        <Text style={styles.title}>
                            {challenge.title}
                        </Text>

                        <View style={styles.durationBadge}>
                            <Feather name="calendar" size={16} color="#6366F1"/>
                            <Text style={styles.durationText}>
                                {challenge.duration_days} days challenge
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.contentContainer}>
                {/* Info Cards */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                        <View style={[styles.iconContainer, {backgroundColor: '#EEF2FF'}]}>
                            <Feather name="target" size={24} color="#6366F1"/>
                        </View>
                        <Text style={styles.infoLabel}>Level</Text>
                        <Text style={[styles.infoValue, {color: getLevelColor(challenge.level)}]}>
                            {challenge.level}
                        </Text>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={[styles.iconContainer, {backgroundColor: '#F0FDF4'}]}>
                            <Feather name="clock" size={24} color="#10B981"/>
                        </View>
                        <Text style={styles.infoLabel}>Duration</Text>
                        <Text style={styles.infoValue}>{challenge.duration_days} days</Text>
                    </View>
                </View>

                {/* Description Card */}
                <View style={styles.descriptionCard}>
                    <View style={styles.sectionHeader}>
                        <Feather name="align-left" size={20} color="#374151"/>
                        <Text style={styles.sectionTitle}>About This Challenge</Text>
                    </View>

                    <Text style={styles.description}>
                        {challenge.description || 'No description available for this challenge. Start your journey now!'}
                    </Text>
                </View>

                {/* Stats Card */}
                {
                    join ? (<Button handlePress={() => {
                    }} color={Colors.light.success} label={"Joined"}/>) : (
                        <ButtonOutline disable={loadingJoin} color={Colors.light.primary}
                                       handlePress={handleJoinChallenge} text={"Start"}/>
                    )
                }
            </View>

            <View style={styles.containerDayList}>
                {
                    challengeDays.map(value => (dayComplete.includes(value.id) ?  <DayChallenge onPress={() => {
                        setChallengeDay(value);
                        //@ts-ignore
                        router.push("/(day)/" + value.id)
                    }} isActive={false} isCompleted={true} key={value.id} day={value}/> : <DayChallenge onPress={() => {
                        setChallengeDay(value);
                        //@ts-ignore
                        router.push("/(day)/" + value.id)
                    }} isActive={false} isCompleted={false} key={value.id} day={value}/> ))
                }
            </View>
            <SuccessModal visible={modal} onClose={() => {
                setModal(false)
            }}/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    heroContainer: {
        height: 320,
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        paddingHorizontal: 24,
        paddingBottom: 32,
        justifyContent: 'flex-end',
    },
    heroContent: {
        gap: 12,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        backdropFilter: 'blur(10px)',
        gap: 6,
    },
    levelText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    title: {
        color: 'white',
        fontWeight: '800',
        fontSize: 32,
        lineHeight: 38,
        textTransform: 'capitalize',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 4,
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    durationText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    contentContainer: {
        padding: 24,
        gap: 24,
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: '#F9FAFB',
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    infoCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    descriptionCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: '#4B5563',
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
    },
    ctaButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#6366F1',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
    },
    ctaText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    additionalInfo: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    additionalText: {
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
    },

    containerDayList: {
        paddingHorizontal: 12,
    }
});