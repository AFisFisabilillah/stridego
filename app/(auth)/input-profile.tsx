import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import {useLocalSearchParams} from "expo-router/build/hooks";
import {useImmer} from "use-immer";
import {router} from "expo-router";

type Profile = Database["public"]["Tables"]["profiles"]["Insert"];

export default function ProfileForm() {
    const {id} = useLocalSearchParams<{id:string}>();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string>();
    const [errorUsername, setErrorUsername] = useState<string>();
    const [form, setForm] = useImmer<Profile>({
        username: "",
        fullname: "",
        gender: "",
        weight: 0,
        height: 0,
        avatar_url: "",
        id:id,
    });

    console.log(id)

    function handleChange(field: keyof Profile, value: string):void {
        if (field === "weight" || field === "height") {
            setForm(draft => {
                draft[field] = Number(value)
            });
        } else {
            setForm(draft => {
                draft[field] = value
            });
        }
        setApiError("");
    }

    function handleChangeUsername(value:string):void {
        const regex:RegExp=/^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/
        if(!regex.test(value) && form.username){
            setErrorUsername("username invalid");
        }else{
            setErrorUsername("")
        }
        setForm(draft => {
            draft.username = value
        });
    }

    async function handleSubmit() {
        console.log("id : " + id)
        if (!form.username || !form.fullname || !form.gender) {
            setApiError("Semua field wajib diisi!");
            return;
        }

        setLoading(true);
        try {
            const { data: existing, error: checkError } = await supabase
                .from("profiles")
                .select("username")// @ts-ignore
                .eq("username", form.username )
                .maybeSingle();

            if (existing) {
                setErrorUsername("Username sudah digunakan!");
                setLoading(false);
                return;
            }

            if (checkError) throw checkError;

            // @ts-ignore
            const { data,error: insertError } = await supabase.from("profiles").insert(form);

            if (insertError) throw insertError;
            console.log(data)
            alert("success ada data");
            setForm({
                username: "",
                fullname: "",
                gender: "",
                weight: 0,
                height: 0,
                avatar_url: "",
                id:form.id,
            });
            router.replace("/(tabs)/(workout)");
        } catch (err) {
            console.error(err);
            setApiError("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Lengkapi Profil</Text>
            <View style={styles.card}>
                <View >
                    <Text style={styles.label}>Masukan Username</Text>
                    <TextInput
                        style={[styles.input, errorUsername && {borderColor:Colors.light.error}]}
                        placeholder={"Username"}
                        placeholderTextColor={Colors.light.icon}
                        value={form.username}
                        keyboardType={"default"}
                        onChangeText={handleChangeUsername}
                    />
                    <View style={styles.containerErrorUsername}>
                        {errorUsername && <Text style={styles.errorUsername}>{errorUsername}</Text>}
                    </View>
                </View>


                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Fullname</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={"Fullname"}
                        placeholderTextColor={Colors.light.icon}
                        value={form.fullname}
                        keyboardType={"default"}
                        onChangeText={(v:string)=> handleChange("fullname", v)}
                    />
                </View>

                <Text style={styles.label}>Jenis Kelamin</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={form.gender}
                        onValueChange={(v) => handleChange("gender", v)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Pilih jenis kelamin" value="" />
                        <Picker.Item label="Laki-laki" value="Male" />
                        <Picker.Item label="Perempuan" value="Female" />
                    </Picker>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Berat Badan (Kg)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={"Berat Badan (kg)"}
                        placeholderTextColor={Colors.light.icon}
                        value={form.weight.toString()}
                        keyboardType={"numeric"}
                        onChangeText={(v:string)=> handleChange("weight", v)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tinggi Badan (Cm)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={"Tinggi Badan (cm)"}
                        placeholderTextColor={Colors.light.icon}
                        value={form.height.toString()}
                        keyboardType={"numeric"}
                        onChangeText={(v:string)=> handleChange("height", v)}
                    />
                </View>

                {apiError && <Text style={styles.errorText}>{apiError}</Text>}

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Simpan Profil</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.background,
        flexGrow: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        color: Colors.light.primary,
        fontWeight: "700",
        marginBottom: 25,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.light.text,
        marginBottom: 6,
    },
    input: {
        borderWidth:1,
        borderColor:"#F3F6FA",
        backgroundColor: "#F3F6FA",
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: "#000",
    },
    pickerContainer: {
        backgroundColor: "#F3F6FA",
        borderRadius: 10,
        marginBottom: 18,
        overflow: "hidden",
    },
    picker: {
        color: "#000",
        ...Platform.select({
            android: { height: 50 },
        }),
    },
    errorText: {
        color: Colors.light.error,
        textAlign: "center",
        fontWeight: "500",
        marginBottom: 10,
    },
    button: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    containerErrorUsername:{
        height:24,
    },
    errorUsername:{
        color:"red",
        marginVertical:2
    }
});
