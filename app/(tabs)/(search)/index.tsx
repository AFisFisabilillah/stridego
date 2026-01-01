import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Image, Alert,
} from 'react-native';
import { Colors } from '@/constants/theme';
import {searchUsersSimple, toggleFollow, UserProfile} from '@/services/search.service';
import { useAuthContext } from '@/hooks/use-auth-contex';
import { useNavigation } from '@react-navigation/native';
import {SafeAreaView} from "react-native-safe-area-context";
import {MaterialIcons} from "@expo/vector-icons";
import {useImmer} from "use-immer";
import {router} from "expo-router";

export default function SearchScreen() {
    const [search, setSearch] = useState<string>('');
    const [searchResults, setSearchResults] = useImmer<UserProfile[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { session } = useAuthContext();
    const currentUserId = session?.user?.id;

    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    // Debounce search input
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (search.trim()) {
            setLoading(true);
            searchTimeoutRef.current = setTimeout(() => {
                performSearch(search.trim());
            }, 500); // Delay 500ms
        } else {
            setSearchResults([]);
            setLoading(false);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [search]);

    const performSearch = async (searchTerm: string) => {
        try {
            const results = await searchUsersSimple(searchTerm, currentUserId);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearch('');
        setSearchResults([]);
    };

    const handleUserPress = (userId: string, isFollowing:boolean) => {
        router.push({
            pathname:"/(user)/[id]",
            params:{
                id:userId,
                isFollowing:String(isFollowing)
            }
        })
    };

    const handleFollow = async (followingId:string,index:number )=>{
        try{
            const data = await toggleFollow(currentUserId as string, followingId);
            setSearchResults(draft => {
                 draft[index].is_following = data;
            });

        }catch(error){
            //@ts-ignore
            Alert.alert("cant follow, Something Was Wrong", error);
        }
    }

    const renderUserItem = (user: UserProfile, index: number) => {
        const isFollowing = user.is_following || false;

        return (
            <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => handleUserPress(user.id, user.is_following)}
                activeOpacity={0.7}
            >
                <Image
                    source={
                        user.avatar_url
                            ? { uri: user.avatar_url }
                            : require('@/assets/no_profile.jpeg')
                    }
                    style={styles.avatar}
                />

                <View style={styles.userInfo}>
                    <Text style={styles.username}>{user.username}</Text>
                    <Text style={styles.fullname}>{user.fullname}</Text>

                    {/* Tampilkan followers count jika ada */}
                    {(user.followers_count !== undefined && user.followers_count > 0) && (
                        <Text>
                            {user.followers_count} pengikut
                        </Text>
                    )}
                </View>

                {currentUserId && currentUserId !== user.id && (
                    <TouchableOpacity
                        onPress={() => handleFollow(user.id, index)}
                        style={[
                            styles.followButton,
                            isFollowing ? styles.unfollowButton : styles.followButton
                        ]}
                    >
                        <Text style={[
                            styles.followButtonText,
                            isFollowing ? styles.unfollowButtonText : styles.followButtonText
                        ]}>
                            {isFollowing ? 'Mengikuti' : 'Ikuti'}
                        </Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Cari Pengguna</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={20} color={Colors.light.gray} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari username atau nama..."
                        placeholderTextColor={Colors.light.gray}
                        value={search}
                        onChangeText={setSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <MaterialIcons name="close" size={20} color={Colors.light.gray} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Results */}
            <View style={styles.resultsContainer}>
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={Colors.light.primary} />
                        <Text style={styles.loadingText}>Mencari...</Text>
                    </View>
                ) : searchResults.length > 0 ? (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.resultsCount}>
                            Ditemukan {searchResults.length} pengguna
                        </Text>
                        {searchResults.map(renderUserItem)}
                    </ScrollView>
                ) : search.length > 0 ? (
                    <View style={styles.centerContainer}>
                        <MaterialIcons name="search-off" size={60} color={Colors.light.gray} />
                        <Text style={styles.noResultsText}>
                            Tidak ada pengguna ditemukan
                        </Text>
                    </View>
                ) : (
                    <View style={styles.centerContainer}>
                        <MaterialIcons name="people" size={80} color={Colors.light.gray} />
                        <Text style={styles.placeholderTitle}>Cari Teman</Text>
                        <Text style={styles.placeholderText}>
                            Ketik username atau nama untuk mencari pengguna lain
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.title,
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#fff',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        marginRight: 8,
        fontSize: 16,
        color: Colors.light.title,
        paddingVertical: 4,
    },
    resultsContainer: {
        flex: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.light.paragraph,
    },
    resultsCount: {
        fontSize: 14,
        color: Colors.light.paragraph,
        marginBottom: 12,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.title,
        marginBottom: 2,
    },
    fullname: {
        fontSize: 14,
        color: Colors.light.paragraph,
    },
    followButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: Colors.light.primary,
    },
    unfollowButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: Colors.light.danger,
    },
    followButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },

    unfollowButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },

    noResultsText: {
        fontSize: 16,
        color: Colors.light.paragraph,
        marginTop: 12,
        textAlign: 'center',
    },
    placeholderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.title,
        marginTop: 16,
        marginBottom: 8,
    },
    placeholderText: {
        fontSize: 14,
        color: Colors.light.paragraph,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    },
});