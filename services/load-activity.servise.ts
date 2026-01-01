// services/activity.service.ts
import { supabase } from '@/lib/supabase';
import {data} from "browserslist";

export interface ActivityCard {
    id: string;
    created_at: string;
    title: string;
    description?: string;
    type: 'running' | 'challenge' | 'custom_workout';
    calorie: number;
    duration: number;
    // Additional data based on type
    running_data?: {
        distance: number;
        pace: string;
        route?: any;
    };
    challenge_data?: {
        challenge_title: string;
        day_number: number;
        completed_exercise: string;
    };
    custom_workout_data?: {
        workout_title: string;
        completed_exercise: string;
    };
    images?: string[];
}

export const fetchUserActivities = async (userId: string): Promise<ActivityCard[]> => {
    try {
        // Fetch main activities
        const { data: activities, error } = await supabase
            .from('activities')
            .select(`
        *,
        activities_images(image_url),
        activities_running(*),
        user_challenge_days!activity_id(
          challenge_days!challenge_days_id(
            title,
            day_number,
            challenge:challenge_days_challenge_id_fkey(
              title
            )
          ),
          completed_exercise,
          avg_calorie
        ),
        user_custom_workouts!activity_id(
          custom_workout:custom_workouts!user_custom_workouts_custom_workout_id_fkey(
            title
          ),
          completed_exercise,
          avg_calories
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        console.log("response supabase", activities)
        // Transform data
        const transformedActivities: ActivityCard[] = activities.map(activity => {
            const baseCard: ActivityCard = {
                id: activity.id,
                created_at: activity.created_at,
                title: activity.title || '',
                description: activity.description,
                type: activity.type as any,
                calorie: activity.calorie || 0,
                duration: activity.duration || 0,
                //@ts-ignore
                images: activity.activities_images?.map(img => img.image_url) || []
            };

            // Add type-specific data
            switch (activity.type) {
                case 'running':
                    if (activity.activities_running && activity.activities_running.length > 0) {
                        const runningData = activity.activities_running[0];
                        baseCard.running_data = {
                            distance: runningData.distance || 0,
                            pace: runningData.pace || '0:00',
                            route: runningData.route
                        };
                    }
                    break;

                case 'challenge':
                    if (activity.user_challenge_days && activity.user_challenge_days.length > 0) {
                        const challengeData = activity.user_challenge_days[0];
                        baseCard.challenge_data = {
                            challenge_title: challengeData.challenge_days?.challenge?.title || 'Challenge',
                            day_number: challengeData.challenge_days?.day_number || 0,
                            completed_exercise: challengeData.completed_exercise || '0/0'
                        };
                    }
                    break;

                case 'custom_workout':
                    if (activity.user_custom_workouts && activity.user_custom_workouts.length > 0) {
                        const workoutData = activity.user_custom_workouts[0];
                        baseCard.custom_workout_data = {
                            workout_title: workoutData.custom_workout?.title || 'Custom Workout',
                            completed_exercise: workoutData.completed_exercise || '0/0'
                        };
                    }
                    break;
            }

            return baseCard;
        });

        return transformedActivities;
    } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
};

// services/activity.service.ts - Perbaikan query
export const fetchActivityDetailSimple = async (activityId: string): Promise<ActivityCard | null> => {
    try {
        // Fetch main activity
        const { data: activity, error: activityError } = await supabase
            .from('activities')
            .select('*')
            .eq('id', activityId)
            .single();

        if (activityError) throw activityError;

        // Fetch images
        const { data: images } = await supabase
            .from('activities_images')
            .select('image_url')
            .eq('activity_id', activityId);

        // Fetch additional data based on type
        let additionalData: any = {};

        switch (activity.type) {
            case 'running':
                const { data: runningData } = await supabase
                    .from('activities_running')
                    .select('*')
                    .eq('activity_id', activityId)
                    .single();
                additionalData.running_data = runningData;
                break;

            case 'challenge':
                const { data: challengeDay } = await supabase
                    .from('user_challenge_days')
                    .select(`
            completed_exercise,
            avg_calorie,
            challenge_days(
              title,
              day_number,
              challange_templates(title)
            )
          `)
                    .eq('activity_id', activityId)
                    .single();
                additionalData.challenge_data = challengeDay;
                break;

            case 'custom_workout':
                const { data: customWorkout } = await supabase
                    .from('user_custom_workouts')
                    .select(`
            completed_exercise,
            avg_calories,
            custom_workouts(title)
          `)
                    .eq('activity_id', activityId)
                    .single();
                additionalData.custom_workout_data = customWorkout;
                break;
        }

        // Transform to ActivityCard
        const transformed: ActivityCard = {
            id: activity.id,
            created_at: activity.created_at,
            title: activity.title || '',
            description: activity.description,
            type: activity.type as any,
            calorie: activity.calorie || 0,
            duration: activity.duration || 0,
            images: images?.map(img => img.image_url) || []
        };

        // Add additional data
        if (additionalData.running_data) {
            transformed.running_data = {
                distance: additionalData.running_data.distance || 0,
                pace: additionalData.running_data.pace || '0:00',
                route: additionalData.running_data.route
            };
        }

        if (additionalData.challenge_data) {
            transformed.challenge_data = {
                challenge_title: additionalData.challenge_data.challenge_days?.challange_templates?.title || 'Challenge',
                day_number: additionalData.challenge_data.challenge_days?.day_number || 0,
                completed_exercise: additionalData.challenge_data.completed_exercise || '0/0'
            };
        }

        if (additionalData.custom_workout_data) {
            transformed.custom_workout_data = {
                workout_title: additionalData.custom_workout_data.custom_workouts?.title || 'Custom Workout',
                completed_exercise: additionalData.custom_workout_data.completed_exercise || '0/0'
            };
        }

        return transformed;
    } catch (error: any) {
        console.error('Error fetching activity detail:', error);
        return null;
    }
};

export const countActivity = async (userId: string): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) throw error;
        return count || 0;
    } catch (error) {
        console.error('Error counting activities:', error);
        return 0;
    }
};