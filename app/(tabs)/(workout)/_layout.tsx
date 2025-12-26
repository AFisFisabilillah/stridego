import { Stack } from "expo-router";

export default function WorkoutLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen  name="workout" />
            <Stack.Screen name="[idChallenge]" />
            <Stack.Screen options={{headerShown:true}} name="workout-player" />
            <Stack.Screen name="workout-summary" />
            <Stack.Screen name="(day)/[idDay]" />
        </Stack>
    );
}
