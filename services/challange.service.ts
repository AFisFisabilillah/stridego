import {supabase} from "@/lib/supabase";
import {FilterChallenge} from "@/types/challenge";

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
    }
    else if (["beginner", "intermediate", "advanced"].includes(filter.id)) {
        query = supabase
            .from("challange_templates")
            .select("*")
            .eq("level", filter.value);
    }
    else {
        query = supabase
            .from("challange_templates")
            .select("*");
    }

    const { data, error } = await query;
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