// utils/storage.ts
import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'profile';

export const uploadProfileImage = async (
    fileUri: string,
    fileName: string,
    userId: string
): Promise<string> => {
    try {
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Create unique filename
        const fileExt = fileName.split('.').pop();
        const newFileName = `${userId}-${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(newFileName, blob, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(newFileName);

        return publicUrl;
    } catch (error: any) {
        throw new Error('Failed to upload image: ' + error.message);
    }
};

export const deleteProfileImage = async (avatarUrl: string): Promise<void> => {
    try {
        const avatarPath = avatarUrl.split('/').pop();
        if (avatarPath) {
            await supabase.storage
                .from(BUCKET_NAME)
                .remove([avatarPath]);
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};