import {supabase} from "@/lib/supabase";
import {ExerciseDay, FilterChallenge} from "@/types/challenge";
import {id} from "@gorhom/bottom-sheet/src/utilities/id";

export async function getChallengeAll(filter: FilterChallenge) {
    let query;

    if (filter.id === "joined") {
        if (!filter.value) return [];

        query = supabase
            .from("user_challanges")
            .select(`
                id,
                completed_at,
                challange_templates (
                    *
                )
            `)
            .eq("user_id", 'dd2cf399-fc02-4c19-8c71-113e08667a56');
    } else if (["beginner", "intermediate", "advanced"].includes(filter.id)) {
        query = supabase
            .from("challange_templates")
            .select("*")
            .eq("level", filter.value);
    } else {
        query = supabase
            .from("challange_templates")
            .select("*");
    }

    const {data, error} = await query;
    console.log("query result :", data)

    if (error) {
        console.error("Fetch Error:", error.message);
        throw error;
    }

    if (filter.id === "joined" && data) {

        return data.map((item: any) => item.challange_templates).filter(Boolean);
    }

    return data;
}

export async function getDetailChallenge(id: string) {
    const {data, error} = await supabase
        .from("challange_templates")
        .select(`
      id,
      title,
      description,
      level,
      duration_days,
      cover_image_url,
      challenge_days (
        id,
        title,
        day_number,
        created_at
      )
    `)
        .eq("id", id)
        .single();
    console.log("data hasil fetch :", data)
    if (error) throw error;
    return data;
}

export async function getDayExercise(id: string): Promise<ExerciseDay[]> {
    const {data, error} = await supabase
        .from("challenge_day_exercises")
        .select("id, reps, duration_second, exercises(*)")
        .eq("challenge_day_id", id);

    if (error) throw error;

    const result: ExerciseDay[] = (data ?? []).map((item: any) => ({
        id: item.id,
        reps: item.reps,
        duration_second: item.duration_second,
        exercise: item.exercises,
    }));

    return result;
}

export async function isUserJoinChallenge(idUser: string, idChallenge: string) {
    let join = false;
    const {data, error} = await supabase
        .from("user_challanges").select("id")
        .eq("user_id", idUser)
        .eq("challenge_id", idChallenge)
        .maybeSingle();

    if (error) throw error;

    console.log("id join", data)
    if(data){
        join = true;
    }

    return {id:data, isJoin:join};
}

export async function joinChallenge(idChallenge:string,idUser:string) {
    const {data, error} = await supabase
        .from("user_challanges")
        .insert({
            user_id: idUser,
            challenge_id:idChallenge
        }).select("id")
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function saveProgressChallenge(userChallengeId:number | null,challengeDayId:number|undefined){
    const {data, error} = await supabase
        .from("user_challenge_days")
        //@ts-ignore
        .insert({
            user_challenge_id:userChallengeId,
            challenge_days_id:challengeDayId,
            is_completed:true.valueOf()
        }).select("id");
    if (error) throw error;
    return data;
}

export async function getChallengeDayComplete(idUser:string, idChallenge:string){
    if (!idUser){
        return [];
    }
    const {data, error} = await supabase
        .from("user_challenge_days")
        .select("challenge_days(id)")
        .eq("user_challenge_id", idUser)
        .eq("challenge_days.challenge_id", idChallenge);

    if (error) throw error;
    if(data?.length === 0 ){
        return [];
    }
    const newData = data?.map((item: any) => {
        if(!item.challenge_days){
            return;
        }
        return item.challenge_days.id;
    });
    return newData;
}
