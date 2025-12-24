// screens/challenge/ChallengeListScreen.tsx
import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    StatusBar,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { supabase } from '@/lib/supabase';
import {ChallengeTemplate, FilterChallenge} from '@/types/challenge';
import { Ionicons } from '@expo/vector-icons';
import {Colors} from "@/constants/theme";
import ChallengeTemplateCard from "@/components/ChallengeTemplateCard";
import {SafeAreaView} from "react-native-safe-area-context";
import {getChallengeAll} from "@/services/challange.service";
import {useImmer} from "use-immer";
import {useAuthContext} from "@/hooks/use-auth-contex";
import {router} from "expo-router";

const filters:FilterChallenge[] = [
    { id: 'all', label: 'All Challenges',value:"all"},
    { id: 'joined', label: 'My Challenges' ,value:""},
    { id: 'beginner', label: 'Beginner' ,value:"beginner"},
    { id: 'intermediate', label: 'Intermediate' ,value:"intermediate"},
    { id: 'advanced', label: 'Advanced' ,value:"advanced"},
];


const ChallengeListScreen = () => {
    const [challenge, setChallenge] = useImmer<ChallengeTemplate | null>(null);
    const [loading , setLoading ] = useState<boolean>(false);
    const [filter , setFilter ] = useImmer<FilterChallenge>(filters[0]);
    const {session} = useAuthContext();
    const [refreshing, setRefreshing] = useState(false);

    const fetchChallenge = async () =>{
        try{
            let currentFilter = { ...filter };

            if (filter.id === "joined") {
                const userId = session?.user?.id;
                if (!userId) {
                    setChallenge([]);
                    return;
                }
                currentFilter.value = userId;
                setFilter(draft => {
                    draft.value = userId;
                });
            }
            console.log("user id " , filter.value)
            const data = await getChallengeAll(currentFilter);
            //@ts-ignore
            setChallenge(data)
        }catch (e){
            console.log(e)
        }
    }

    useEffect(() => {
        setLoading(true);
        fetchChallenge().finally(()=>{setLoading(false)})
    }, [filter]);



    async function handleRefresh() {
        setRefreshing(true);
        await fetchChallenge();
        setRefreshing(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

            {/* header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Challenges</Text>
                    <Text style={styles.headerSubtitle}>
                        Join and complete fitness challenges
                    </Text>
                </View>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="search" size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            {/*filter challenge*/}
            <FlatList
                horizontal
                data={filters}
                renderItem={({ item,index }) => {
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.filterChip,
                                filter?.id === item.id && styles.filterChipActive,
                            ]}
                            onPress={() => {
                                setFilter(filters[index])
                            }}>
                            <Text style={[
                                styles.filterChipText,
                                filter?.id === item.id && styles.filterChipTextActive,
                            ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.filterContainer}
                showsHorizontalScrollIndicator={false}
            />

                <FlatList
                data={challenge}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors.light.primary]}
                        tintColor={Colors.light.primary}
                    />
                }
                contentContainerStyle={styles.listContent}
                renderItem={({item})=>{
                    return(
                        <ChallengeTemplateCard
                            userProgress={100}
                            challenge={item}
                            onPress={()=>{router.push(`/(workout)/${item.id}`)}} />
                    )
                }}
            />
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
        paddingVertical: 16,
        backgroundColor: Colors.light.background,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.light.text,
        fontFamily: 'Inter-ExtraBold',
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontFamily: 'Inter-Regular',
        marginTop: 4,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
        height:70
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        height:40
    },
    filterChipActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    filterChipText: {
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: 'Inter-Medium',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
        fontFamily: 'Inter-SemiBold',
    },
    listContent: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
        marginTop: 16,
        fontFamily: 'Inter-Bold',
    },
    emptyStateText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
        fontFamily: 'Inter-Regular',
    },
});
export default ChallengeListScreen;