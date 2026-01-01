import {Stack} from "expo-router";

export default function AuthFunction(){
    return (
        <>
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name={"login"}/>
                <Stack.Screen name={"register"}/>
                <Stack.Screen name={"verification-code"} />
                <Stack.Screen name={"input-profile"}/>
            </Stack>
        </>
    )
}

//TODO: 1. Membuat forget password dan menambhakan lihat password di input