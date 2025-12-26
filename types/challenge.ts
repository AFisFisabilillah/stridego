export interface ChallengeTemplate {
    id: string;
    title: string;
    description: string | null;
    level: 'beginner' | 'intermediate' | 'advanced' | string;
    duration_days: number;
    cover_image_url: string | null;
    created_at: string;
}

export interface ChallengeDay {
    id: number;
    challenge_id: string;
    title: string;
    day_number: number;
}

export interface ChallengeWorkout {
    id: number;
    challenge_day_id: number;
    workout_name: string;
    duration_in_second: number;
}

export interface UserChallenge {
    id: number;
    user_id: string;
    challenge_id: string;
    completed_at: string | null;
    created_at: string;
}

export interface FilterChallenge {
    id: string;
    label: string;
    value: string;
}

export interface ExerciseDay {
    id: number;
    exercise: Exercise;
    reps: number;
    duration_second: number;
}

export interface Exercise {
    id: number,
    name: string,
    image: string,
    description: string,
    met: number,
    otot: string,
}

// types/workout.ts
export enum WorkoutStatus {
    IDLE = 'idle',
    PREPARING = 'preparing',
    ACTIVE = 'active',
    RESTING = 'resting',
    COMPLETED = 'completed'
}

export type WorkoutPhase = 'exercise' | 'rest';
export interface WorkoutComplete {
    completedCount:number,
    totalExercises:number,
    totalTime:number,
    workoutData:{
        exercises: ExerciseDay[],
        completed:number[],
        totalTime:number,
    }
}