// services/search.simple.service.ts
import { supabase } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    username: string;
    fullname: string;
    avatar_url: string;
    followers_count?: number;
    following_count?: number;
    is_following?: boolean;
}

// Fungsi search yang paling simple
export const searchUsersSimple = async (searchTerm: string, currentUserId?: string): Promise<UserProfile[]> => {
    try {
        if (!searchTerm.trim()) {
            return [];
        }

        console.log('Searching for:', searchTerm, 'Current User:', currentUserId);

        // Query untuk mencari user
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username, fullname, avatar_url')
            .or(`username.ilike.%${searchTerm}%,fullname.ilike.%${searchTerm}%`)
            .neq('id', currentUserId || '') // Exclude current user
            .limit(20);

        if (error) {
            console.error('Error searching users:', error);
            return [];
        }

        if (!profiles || profiles.length === 0) {
            console.log('No users found');
            return [];
        }

        console.log('Found users:', profiles.length);

        // Jika ada currentUserId, cek status follow untuk semua user
        if (currentUserId) {
            // Get all user IDs
            const userIds = profiles.map(p => p.id);

            // Query semua status follow sekaligus
            const { data: followData, error: followError } = await supabase
                .from('followers')
                .select('following_id')
                .eq('follower_id', currentUserId)
                .in('following_id', userIds);

            if (followError) {
                console.error('Error getting follow status:', followError);
            }

            // Create a Set untuk quick lookup
            const followingIds = new Set(followData?.map(f => f.following_id) || []);

            // Untuk setiap user, hitung followers count dan check follow status
            const usersWithStats: UserProfile[] = await Promise.all(
                profiles.map(async (profile) => {
                    // Get followers count
                    const { count: followersCount } = await supabase
                        .from('followers')
                        .select('*', { count: 'exact', head: true })
                        .eq('following_id', profile.id);

                    // Get following count
                    const { count: followingCount } = await supabase
                        .from('followers')
                        .select('*', { count: 'exact', head: true })
                        .eq('follower_id', profile.id);

                    return {
                        id: profile.id,
                        username: profile.username,
                        fullname: profile.fullname,
                        avatar_url: profile.avatar_url,
                        followers_count: followersCount || 0,
                        following_count: followingCount || 0,
                        is_following: followingIds.has(profile.id)
                    };
                })
            );

            return usersWithStats;
        } else {
            // Jika tidak ada currentUserId, return data dasar
            const usersWithBasicStats: UserProfile[] = await Promise.all(
                profiles.map(async (profile) => {
                    // Get followers count
                    const { count: followersCount } = await supabase
                        .from('followers')
                        .select('*', { count: 'exact', head: true })
                        .eq('following_id', profile.id);

                    // Get following count
                    const { count: followingCount } = await supabase
                        .from('followers')
                        .select('*', { count: 'exact', head: true })
                        .eq('follower_id', profile.id);

                    return {
                        id: profile.id,
                        username: profile.username,
                        fullname: profile.fullname,
                        avatar_url: profile.avatar_url,
                        followers_count: followersCount || 0,
                        following_count: followingCount || 0,
                        is_following: false
                    };
                })
            );

            return usersWithBasicStats;
        }
    } catch (error) {
        console.error('Error in searchUsersSimple:', error);
        return [];
    }
};
export const checkFollowStatus = async (followerId: string, followingId: string): Promise<boolean> => {
    try {
        const { data } = await supabase
            .from('followers')
            .select('id')
            .eq('follower_id', followerId)
            .eq('following_id', followingId)
            .maybeSingle();

        return !!data;
    } catch (error) {
        console.error('Error checking follow status:', error);
        return false;
    }
};

export const toggleFollow = async (followerId: string, followingId: string): Promise<boolean> => {
    try {
        console.log('toggleFollow called with:', { followerId, followingId });

        if (!followerId || !followingId) {
            throw new Error('followerId atau followingId tidak valid');
        }

        const { data: existing, error: checkError } = await supabase
            .from('followers')
            .select('id')
            .eq('follower_id', followerId)
            .eq('following_id', followingId)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking follow status:', checkError);
            throw checkError;
        }

        console.log('Existing follow data:', existing);

        if (existing) {
            console.log('Unfollowing user...');
            const { error: deleteError } = await supabase
                .from('followers')
                .delete()
                .eq('follower_id', followerId)
                .eq('following_id', followingId);

            if (deleteError) {
                console.error('Error unfollowing:', deleteError);
                throw deleteError;
            }

            console.log('Successfully unfollowed');
            return false;
        } else {
            console.log('Following user...');
            const { error: insertError } = await supabase
                .from('followers')
                .insert({
                    follower_id: followerId,
                    following_id: followingId,
                });

            if (insertError) {
                console.error('Error following:', insertError);
                throw insertError;
            }

            console.log('Successfully followed');
            return true; // Now followed
        }
    } catch (error: any) {
        console.error('Error in toggleFollow:', error);
        if (error.message?.includes('duplicate key')) {
            throw new Error('Sudah mengikuti pengguna ini');
        } else if (error.message?.includes('foreign key')) {
            throw new Error('User tidak ditemukan');
        }
        throw new Error(`Gagal mengupdate follow status: ${error.message}`);
    }
};

export async function getUserProfile(userId:string){
    const {data, error} = await supabase
        .from("profiles")
        .select("id,avatar_url, username,fullname,gender,weight,height")
        .eq("id", userId)
        .single();

    if(error) throw error;
    return data;
}