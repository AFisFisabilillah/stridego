import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {AnimatedView} from "react-native-reanimated/src/component/View";
import {Dimensions, StyleSheet, Text, View} from "react-native";
import {useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import {log} from "@expo/devtools/build/logger";
interface runningData {
    speed:string,
    distance:string,
    time:string
}
const WIDTH_START = Dimensions.get("window").width * 0.9;
const END_POSITION = 200;

export default function RunningMetricsCard({}) {
    const onLeft = useSharedValue(true);
    const position = useSharedValue(0);

    const widthBox = useSharedValue(WIDTH_START);
    const heightBox = useSharedValue(10);

    const panGestur = Gesture.Pan().onChange((e)=>{
        heightBox.value += e.translationY;
    });

    //@ts-ignore
    const animatedStyle = useAnimatedStyle(() => ({
        width:widthBox.value,
        height:heightBox.value,
    }));

    return (
        <GestureDetector gesture={panGestur} >
            <AnimatedView style={[styles.box, animatedStyle]}>

            </AnimatedView>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    box: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        paddingHorizontal:20,
        paddingVertical:10,
        marginBottom: 30,
        marginHorizontal:"auto"
    },
});