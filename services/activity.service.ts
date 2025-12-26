// services/activity.service.ts
import {supabase} from "@/lib/supabase";
import {Activity, ActivityRunning} from "@/types/activities";
import {SelectedImage} from "@/components/ImagePicker";
import * as FileSystem from 'expo-file-system';
export const uploadActivityImages = async (userId: string, images: SelectedImage[]): Promise<string[]> => {
    try {
        const uploadPromises = images.map(async (image) => {
            if (!image.uri) {
                throw new Error('URI gambar tidak ditemukan');
            }

            // Generate unique filename
            const extension = image.uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
            const filePath = `${userId}/${fileName}`;

            const response = await fetch(image.uri);
            const arrayBuffer = await response.arrayBuffer();

            // Upload ke Supabase Storage
            const { data, error } = await supabase.storage
                .from('activity_images')
                .upload(filePath, arrayBuffer, {
                    contentType:`image/${extension}`,
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Upload error:', error);
                throw error;
            }

            // Dapatkan URL public
            const { data: urlData } = supabase.storage
                .from('activity_images')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        });

        // Tunggu semua upload selesai
        const imageUrls = await Promise.all(uploadPromises);
        return imageUrls;

    } catch (error: any) {
        console.error('Error uploading images:', error);
        throw new Error(`Gagal mengupload gambar: ${error.message}`);
    }
};
export const createActivityRunning = async (
    activity: Activity,
    activityRunning: ActivityRunning,
    images: SelectedImage[] = []
) => {
    let imageUrls: string[] = [];
    let uploadedFilePaths: string[] = [];

    try {
        if (images.length > 0) {
            imageUrls = await uploadActivityImages(activity.user_id, images);

            uploadedFilePaths = imageUrls.map(url => {
                const urlObj = new URL(url);
                return urlObj.pathname.split('/').slice(3).join('/');
            });
        }

        // 2. Insert activity
        const { data: activityData, error: activityError } = await supabase
            .from("activities")
            .insert({
                title: activity.title,
                type: activity.type,
                description: activity.description,
                visibility: activity.visibility,
                calorie: activity.calorie,
                duration: activity.duration,
                user_id: activity.user_id,
            })
            .select()
            .single();

        if (activityError) throw activityError;

        // 3. Insert running detail
        const { error: runningError } = await supabase
            .from("activities_running")
            // @ts-ignore
            .insert({
                // @ts-ignore
                activity_id: activityData.id,
                distance: activityRunning.distance,
                pace: activityRunning.pace,
                route: activityRunning.route,
            });

        if (runningError) {
            await supabase
                .from("activities")
                .delete()
                .eq("id", activityData.id);
            throw runningError;
        }

        // 4. Insert images jika ada
        if (imageUrls.length > 0) {
            const imageRecords = imageUrls.map(url => ({
                image_url: url,
                activity_id: activityData.id
            }));

            const { error: imagesError } = await supabase
                .from("activities_images")
                .insert(imageRecords);

            if (imagesError) {
                console.error('Error saving images to database:', imagesError);
            }
        }

        return {
            ...activityData,
            images: imageUrls
        };

    } catch (error: any) {
        console.error('Error in createActivityRunning:', error);

        // Rollback: Hapus gambar yang sudah terupload jika ada error
        if (uploadedFilePaths.length > 0) {
            try {
                await supabase.storage
                    .from('activities-images')
                    .remove(uploadedFilePaths);
            } catch (deleteError) {
                console.error('Error deleting uploaded images:', deleteError);
            }
        }

        throw error;
    }
};

export const getActivityImages = async (activityId: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('activities_images')
            .select('image_url')
            .eq('activity_id', activityId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map(item => item.image_url);
    } catch (error) {
        console.error('Error fetching activity images:', error);
        return [];
    }
};

// Fungsi untuk menghapus gambar activity
export const deleteActivityImages = async (activityId: string): Promise<void> => {
    try {
        // Dapatkan semua gambar untuk activity ini
        const { data: images, error: fetchError } = await supabase
            .from('activities_images')
            .select('image_url')
            .eq('activity_id', activityId);

        if (fetchError) throw fetchError;

        // Hapus dari storage
        if (images && images.length > 0) {
            const filePaths = images.map(item => {
                const urlObj = new URL(item.image_url);
                return urlObj.pathname.split('/').slice(3).join('/');
            });

            await supabase.storage
                .from('activities-images')
                .remove(filePaths);
        }

        // Hapus dari database
        const { error: deleteError } = await supabase
            .from('activities_images')
            .delete()
            .eq('activity_id', activityId);

        if (deleteError) throw deleteError;

    } catch (error) {
        console.error('Error deleting activity images:', error);
        throw error;
    }
};