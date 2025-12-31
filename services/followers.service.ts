import {supabase} from "@/lib/supabase";

export const countingFollowers = async (userId: string) => {
    const {count:countFollowers,error:errorFollowers} = await supabase
        .from('followers')
        .select("id", {count:"exact"})
        .eq("following_id", userId);

    if (errorFollowers) throw errorFollowers;
    const {count:countFollowing, error} = await supabase
        .from('followers')
        .select("id", {count:"exact"})
        .eq("follower_id", userId);
    if (error) throw error;

    return {countFollowing,countFollowers};
}