// components/UserCard.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import {toggleFollow, UserProfile} from '@/services/search.service';
import { Colors } from '@/constants/theme';
import { useAuthContext } from '@/hooks/use-auth-contex';

interface UserCardProps {
    user: UserProfile;
    onPress?: (userId: string) => void;
    onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onPress, onFollowChange }) => {
    const { session } = useAuthContext();
    const currentUserId = session?.user?.id;
    const [isFollowing, setIsFollowing] = useState(user.is_following || false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollowToggle = async () => {
        if (!currentUserId) {
            Alert.alert('Error', 'Anda harus login untuk mengikuti pengguna');
            return;
        }

        if (currentUserId === user.id) {
            Alert.alert('Error', 'Tidak dapat mengikuti diri sendiri');
            return;
        }

        try {
            setIsLoading(true);
            const newFollowStatus = await toggleFollow(currentUserId, user.id);
            setIsFollowing(newFollowStatus);

            if (onFollowChange) {
                onFollowChange(user.id, newFollowStatus);
            }

        } catch (error) {
            console.error('Error toggling follow:', error);
            Alert.alert('Error', 'Gagal mengupdate status follow');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress?.(user.id)}
            activeOpacity={0.7}
        >
            <View style={styles.leftSection}>
                <Image
                    source={
                        user.avatar_url
                            ? { uri: user.avatar_url }
                            : require('@/assets/no_profile.jpeg')
                    }
                    style={styles.avatar}
                    resizeMode="cover"
                />

                <View style={styles.userInfo}>
                    <Text style={styles.username} numberOfLines={1}>
                        {user.username}
                    </Text>
                    <Text style={styles.fullname} numberOfLines={1}>
                        {user.fullname}
                    </Text>

                    <View style={styles.stats}>
                        <Text style={styles.statText}>
                            {user.followers_count} pengikut • {user.following_count} mengikuti
                        </Text>
                    </View>
                </View>
            </View>

            {currentUserId && currentUserId !== user.id && (
                <TouchableOpacity
                    style={[
                        styles.followButton,
                        isFollowing ? styles.followingButton : styles.followButton
                    ]}
                    onPress={handleFollowToggle}
                    disabled={isLoading}
                >
                    <Text style={[
                        styles.followButtonText,
                        isFollowing ? styles.followingButtonText : styles.followButtonText
                    ]}>
                        {isFollowing ? 'Mengikuti' : 'Ikuti'}
                    </Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
    },
    userInfo: {
        marginLeft: 12,
        flex: 1,
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
        marginBottom: 4,
    },
    stats: {
        flexDirection: 'row',
    },
    statText: {
        fontSize: 12,
        color: Colors.light.gray,
    },
    followButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.light.primary,
        minWidth: 80,
        alignItems: 'center',
    },
    followingButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    followButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    followingButtonText: {
        color: Colors.light.paragraph,
    },
});

export default UserCard;