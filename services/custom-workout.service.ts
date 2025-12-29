import {supabase} from "@/lib/supabase";
import {Exercise} from "@/types/challenge";
import {CustomWorkoutExercise} from "@/types/custom-workout";

export const getAllCustomWorkouts = async (userId: string) => {

    const {data, error} = await supabase
        .from('custom_workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {ascending: false});

    if (error) throw error;

    return data;
}

export const getAllExercises = async () => {
    const {data, error} = await supabase
        .from('exercises')
        .select('*')
        .order('name');

    if (error) throw error;

    return data;
}

export const createCustomWorkout = async (title: string, description: string, userId: string) => {
    const {data, error} = await supabase
        .from('custom_workouts')
        .insert({
            title: title.trim(),
            description: description.trim() || null,
            user_id: userId,
        })
        .select("id")
        .single();

    return data;
}

export const createCustomWorkoutExercise = async (exercises: CustomWorkoutExercise[], customWorkoutId: any) => {
    const exercisesToInsert = exercises.map(exercise => ({
        custom_workout_id: customWorkoutId.id,
        exercise_id: exercise.exercise_id,
        reps: exercise.reps,
        duration_second: exercise.duration_second,
        order_index: exercise.order_index,
    }));

    const {error: exercisesError} = await supabase
        .from('custom_workout_exercises')
        .insert(exercisesToInsert);


    if (exercisesError) throw exercisesError;

}

export const getDetailCustomWorkout = async (workoutId: string) => {
    const {data: workoutData, error: workoutError} = await supabase
        .from('custom_workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

    if (workoutError) throw workoutError;

    const {data: exercisesData, error: exercisesError} = await supabase
        .from('custom_workout_exercises')
        .select(`
          *,
          exercise:exercises (*)
        `)
        .eq('custom_workout_id', workoutId)
        .order('order_index');

    if (exercisesError) throw exercisesError;

    return {
        ...workoutData,
        exercises: exercisesData || [],
    };
}

export const deleteCustomWorkout = async (workoutId: string) => {
    const {error: exercisesError} = await supabase
        .from('custom_workout_exercises')
        .delete()
        .eq('custom_workout_id', workoutId);

    if (exercisesError) throw exercisesError;

    // Then delete the workout
    const {error: workoutError} = await supabase
        .from('custom_workouts')
        .delete()
        .eq('id', workoutId);

    if (workoutError) throw workoutError;
}

export const getDetailEditCustomWorkout = async (workoutId: string) => {
    const {data: workoutData, error: workoutError} = await supabase
        .from('custom_workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

    if (workoutError) throw workoutError;

    const {data: exercisesData, error: exercisesError} = await supabase
        .from('custom_workout_exercises')
        .select(`
          id,
          exercise_id,
          reps,
          duration_second,
          order_index,
          exercise:exercises (*)
        `)
        .eq('custom_workout_id', workoutId)
        .order('order_index');

    if (exercisesError) throw exercisesError;

    return {workoutData, exercisesData}
}

export const updateCustomWorkout = async (workoutId: string, title:string,description:string,exercises:CustomWorkoutExercise[]) => {
    const {error: workoutError} = await supabase
        .from('custom_workouts')
        .update({
            title: title.trim(),
            description: description.trim() || null,
        })
        .eq('id', workoutId);

    if (workoutError) throw workoutError;

    const { error: deleteError } = await supabase
        .from('custom_workout_exercises')
        .delete()
        .eq('custom_workout_id', workoutId);

    if (deleteError) throw deleteError;

    const exercisesToInsert = exercises.map(exercise => ({
        custom_workout_id: workoutId,
        exercise_id: exercise.exercise_id,
        reps: exercise.reps,
        duration_second: exercise.duration_second,
        order_index: exercise.order_index,
    }));

    const { error: exercisesError } = await supabase
        .from('custom_workout_exercises')
        .insert(exercisesToInsert);

    if (exercisesError) throw exercisesError;
}

export const createUserCustomWorkout = async (customWorkoutId:string,userId:string,avgCalories:number, totalTime:number,completedExercise:string,activityId:string) => {
    const {data,error} = await supabase
        .from("user_custom_workouts")
        .insert({
            custom_workout_id:customWorkoutId,
            user_id:userId,
            avg_calories:avgCalories,
            total_time:totalTime,
            completed_exercise:completedExercise,
            activity_id:activityId
        })
    if(error) throw error;

}