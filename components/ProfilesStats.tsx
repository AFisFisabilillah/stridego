// ProfileStats.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';

export interface ProfileStatsProps {
    followers: number;
    following: number;
    posts: number;
    onPressFollowers?: () => void;
    onPressFollowing?: () => void;
    onPressPosts?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    numberStyle?: StyleProp<TextStyle>;
    labelStyle?: StyleProp<TextStyle>;
    separatorColor?: string;
    formatNumber?: (num: number) => string;
    abbreviateNumbers?: boolean;animateNumbers?: boolean;
    labels?: {
        followers?: string;
        following?: string;
        posts?: string;
    };
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
                                                       followers,
                                                       following,
                                                       posts,
                                                       onPressFollowers,
                                                       onPressFollowing,
                                                       onPressPosts,
                                                       containerStyle,
                                                       numberStyle,
                                                       labelStyle,
                                                       separatorColor = '#E0E0E0',
                                                       formatNumber,
                                                       abbreviateNumbers = true,
                                                       animateNumbers = false,
                                                       labels = {},
                                                   }) => {
    // Format number with abbreviations
    const formatCount = (count: number): string => {
        if (formatNumber) {
            return formatNumber(count);
        }

        if (!abbreviateNumbers) {
            return count.toLocaleString();
        }

        if (count >= 1000000) {
            return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (count >= 1000) {
            return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return count.toString();
    };

    // Default labels
    const defaultLabels = {
        followers: 'Followers',
        following: 'Following',
        posts: 'Posts',
    };

    const statLabels = { ...defaultLabels, ...labels };

    // Stat item component
    const StatItem = ({
                          count,
                          label,
                          onPress,
                          isFirst = false,
                          isLast = false,
                      }: {
        count: number;
        label: string;
        onPress?: () => void;
        isFirst?: boolean;
        isLast?: boolean;
    }) => {
        const Content = (
            <View style={[
                styles.statItem,
                isFirst && styles.firstItem,
                isLast && styles.lastItem,
            ]}>
                {!isFirst && (
                    <View style={[styles.separator, { backgroundColor: separatorColor }]} />
                )}

                <View style={styles.statContent}>
                    <Text style={[styles.number, numberStyle]}>
                        {formatCount(count)}
                    </Text>
                    <Text style={[styles.label, labelStyle]}>
                        {label}
                    </Text>
                </View>
            </View>
        );

        if (onPress) {
            return (
                <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                    {Content}
                </TouchableOpacity>
            );
        }

        return Content;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.statsRow}>
                <StatItem
                    count={posts}
                    label={statLabels.posts}
                    onPress={onPressPosts}
                    isFirst={true}
                />

                <StatItem
                    count={followers}
                    label={statLabels.followers}
                    onPress={onPressFollowers}
                />

                <StatItem
                    count={following}
                    label={statLabels.following}
                    onPress={onPressFollowing}
                    isLast={true}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 8,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        // Elevation for Android
        elevation: 3,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    firstItem: {
        paddingLeft: 0,
    },
    lastItem: {
        paddingRight: 0,
    },
    separator: {
        width: 1,
        height: '70%',
        marginHorizontal: 8,
    },
    statContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    number: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: '#666666',
    },
});

export default ProfileStats;