import {Stack} from "expo-router";

const WorkoutLayout = ()=>{
    return(
        <Stack screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name ={"index"}/>
            <Stack.Screen name={"(workout)"}/>
            <Stack.Screen name ={"(custom-workout"}/>
        </Stack>
    )
};

export default WorkoutLayout;