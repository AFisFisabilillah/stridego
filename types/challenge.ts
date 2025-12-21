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