import {Exercise} from "@/types/challenge";

export const calculateCalories = (met :number, weight:number, duration:number)=>{
    return met*weight*duration;
}

export const calculateCaloriesFromExercises = (
    exercises: Exercise[],
    totalDurationSecond: number,
    weight: number
): number => {
    if (!exercises.length || weight <= 0 || totalDurationSecond <= 0) {
        return 0;
    }
    const averageMET =
        exercises.reduce((sum, ex, currentIndex) => {
            console.log(" met "+currentIndex, ex.met);
            return sum + ex?.met
        }, 0) / exercises.length;

    const durationMinutes = totalDurationSecond / 60;

    return averageMET * 3.5 * weight / 200 * durationMinutes;
};
