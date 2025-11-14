import {createClient} from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Database} from "@/types/database.types";

const supabaseUrl :string|undefined = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey :string|undefined = process.env.EXPO_PUBLIC_SUPABASE_API_KEY;

const ExpoWebSecureStoreAdapter = {
    getItem: (key: string) => {
        console.debug("getItem", { key })
        return AsyncStorage.getItem(key)
    },
    setItem: (key: string, value: string) => {
        return AsyncStorage.setItem(key, value)
    },
    removeItem: (key: string) => {
        return AsyncStorage.removeItem(key)
    },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoWebSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});