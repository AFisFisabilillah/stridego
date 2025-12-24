import {useLocalSearchParams} from "expo-router/build/hooks";
import {Text, View} from "react-native";

const DetailDay = () => {
    const {idDay} = useLocalSearchParams();
    console.log(idDay)
    return (
        <>
            <View><Text>id Day : {idDay}</Text></View>
        </>
    )
}