import {Exercise} from "@/types/challenge";

export interface CustomWorkoutExercise {
    id?: number;
    exercise_id: string;
    reps: number | null;
    duration_second: number | null;
    order_index: number;
    exercise?: Exercise;
}

export interface CustomWorkout {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
    exercise_count: number;
    total_duration?: number;
    estimated_calories?: number;
}