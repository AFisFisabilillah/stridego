import {supabase} from "@/lib/supabase";

export const getUserStreak = async (userId:string)=>{
    const {data,error} = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userId)
        .single();
    if(error) throw error;
    return data;
}