import * as Location from "expo-location";
import {useEffect, useMemo, useRef, useState} from "react";
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import BottomSheet, {BottomSheetFlatList, BottomSheetView} from "@gorhom/bottom-sheet";
import {SafeAreaView} from "react-native-safe-area-context";
import {TrackingType, TrackingTypes} from "@/types/trackingTypes";
import {Colors} from "@/constants/theme";
import {Image} from "expo-image";
import PlayIcon from "@/assets/icon/Play";
import {AnimatedView} from "react-native-reanimated/src/component/View";
import {Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withTiming} from "react-native-reanimated";
import PauseIcon from "@/assets/icon/PauseIcon";
import {AnimatedText} from "react-native-reanimated/src/component/Text";

export default function TrackingRun() {
    const [location, setLocation] = useState<Location.LocationObject>(null);
    const [errorPermision, setErrorPermision] = useState(false);
    const [trackingType, setTrackingType] = useState<TrackingType>(TrackingTypes[0]);
    const [isStarting, setStarting] = useState<boolean>(false);
    const [isPause, setPause] = useState<boolean>(false);
    const Icon = trackingType.icon;

    const playWidth = useSharedValue<number>(70);
    const buttonSide = useSharedValue<number>(1);
    const textOpacity = useSharedValue<number>(0);
    const textScale = useSharedValue<number>(0);

    //@ts-ignore
    const playAnimationStyle = useAnimatedStyle(() => {
        return {
            flexGrow: withTiming(buttonSide.value > 0.01 ? 0 : 1, {
                duration: 360,
                easing: Easing.elastic(2),
                reduceMotion: ReduceMotion.System,
            }),
            width: withTiming(buttonSide.value > 0.01 ? 70 : "50%", {
                duration: 360,
                easing: Easing.elastic(2),
                reduceMotion: ReduceMotion.System,
            }),
        };
    });

    //@ts-ignore
    const sideButtonAnimationStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scaleX: buttonSide.value }],
            width: withTiming(buttonSide.value > 0.01 ? 60 : 0, { duration: 200 }),
            opacity: withTiming(buttonSide.value, { duration: 200 }),
            marginHorizontal: withTiming(buttonSide.value > 0.01 ? 0 : 0, { duration: 200 }),};
    });

    //@ts-ignore
    const textAnimationStyle= useAnimatedStyle(() => {
        return {
            opacity: withTiming(textOpacity.value, { duration: 300 }),
            transform: [{ scale: withTiming(textScale.value, { duration: 300 }) }]
        }
    })
    const bottomSheetPermision = useRef<BottomSheet | null>(null);
    const bottomSHeetTrackingType = useRef<BottomSheet | null>(null);
    const snapPoints = useMemo(() => ["60%", "70%","100%"], []);

    useEffect(() => {
        if (errorPermision) {
            bottomSheetPermision.current?.snapToIndex(1);
        }
    }, [errorPermision]);

    useEffect(() => {
        async function getCurrentLocation() {
            const {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorPermision(true);
                return;
            }
            setLocation(await Location.getCurrentPositionAsync());
        }

        getCurrentLocation();
    }, []);

    function handlePausePress(){

    }
    function handlePlayPress() {
        if(!isStarting){
            buttonSide.value = withTiming(0, { duration: 200 });
            textScale.value = 0;
            textOpacity.value = 0;

            textScale.value = withTiming(1);
            textOpacity.value =withTiming(1);
            setStarting(true);
        }
    }

    function handlerPressTrackingType(){
        bottomSHeetTrackingType.current?.snapToIndex(1);
    }

    function handlePressChangeTrackingType(index: number) {
        setTrackingType(TrackingTypes[index]);
        bottomSHeetTrackingType.current?.close();
    }

    return (

        <SafeAreaView style={styles.container}>
            <View style={styles.containerButton}>
                <AnimatedView style={[styles.containerIcon, styles.buttonTrackingTypes, sideButtonAnimationStyle]}>
                    <TouchableOpacity  onPress={handlerPressTrackingType}>
                        <Icon width={30} height={30} fill={Colors.light.primary}/>
                    </TouchableOpacity>
                </AnimatedView>
                <AnimatedView style={[styles.containerStart,playAnimationStyle]}>
                    <TouchableOpacity style={styles.touchableStart} onPress={handlePlayPress}>
                        {isStarting ? <PauseIcon width={30} height={30} fill={"#ffffff"} /> : <PlayIcon height={30} width={30}/>}
                        {isStarting && <AnimatedText style={[styles.textPause, textAnimationStyle]}>Jeda</AnimatedText>
                        }
                    </TouchableOpacity>
                </AnimatedView>
                <AnimatedView style={[styles.containerIcon,sideButtonAnimationStyle ]}></AnimatedView>

            </View>
            <BottomSheet ref={bottomSheetPermision} snapPoints={snapPoints} index={-1}>
                <BottomSheetView style={{padding: 20}}>
                    <Image style={styles.iamgePermision} alt={"gambar sda"}
                           source={require("../../../assets/location-permission.svg")}/>
                    <Text style={styles.textPermission}>Izinkan Aplikasi untuk Mengakses Lokasi anda</Text>
                </BottomSheetView>
            </BottomSheet>
            <BottomSheet enablePanDownToClose={true} ref={bottomSHeetTrackingType} snapPoints={snapPoints} index={-1} >
                <BottomSheetFlatList
                    data={TrackingTypes}
                    keyExtractor={item => item.id}
                    renderItem={ ({item,index}) => {
                        const Icon = item.icon;
                        return (
                            <TouchableOpacity onPress={event => {
                                handlePressChangeTrackingType(index)
                            }} style={[styles.containerTypeItems,(item.id == trackingType.id) && styles.typeItemsSelected ]}>
                                <Icon width={28} height={28} fill={(item.id == trackingType.id) ? Colors.light.primary : "#000000"}/>
                                <Text style={[styles.typeItemsText,(item.id == trackingType.id) && styles.typeItemsTextSelected]}>{item.name}</Text>
                            </TouchableOpacity>
                        )
                    }}
                    ListHeaderComponent={() => (
                        <View style={styles.headerTrackingTypes}>
                            <Text style={styles.headerTrackingTypesText}>Pilih Tipe Aktivitas</Text>
                            <View style={styles.lineHeader}></View>
                        </View>
                    )}
                >
                </BottomSheetFlatList>
            </BottomSheet>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    iamgePermision: {
        width: 200,
        height: 200,
        borderColor: 'gray',
        marginHorizontal: "auto"
    },

    textPermission: {
        fontSize: 20,
        color: Colors.light.primary,
        textAlign: "center",
        fontWeight: "bold"
    },

    containerButton: {
        width: "90%",
        marginHorizontal: "auto",
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 40,
        borderRadius: 100,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        gap:4
    },

    buttonTrackingTypes: {
        backgroundColor: "rgba(30,144,255,0.25)",
    },

    containerIcon: {
        width: 60,
        height: 60,
        borderRadius: 80,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
        color: Colors.light.primary,
    },
    containerStart: {
        minWidth: 70,
        height: 70,
        borderRadius: 80,
        backgroundColor: Colors.light.primary,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    touchableStart:{
        width:"100%",
        height:"100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap:18
    },

    icon: {
        width: 30,
        height: 30,
    },

    typeColor: {
        color: Colors.light.primary,
    },

    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-end"
    },

    containerTypeItems: {
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap:25,
        marginHorizontal:10,
        marginVertical:3,
        paddingHorizontal:10,
        paddingVertical:6,
        borderRadius:9
    },

    typeItemsText:{
        fontWeight:"500",
        fontSize:15
    },
    typeItemsSelected:{
        backgroundColor:"rgba(30,144,255,0.15)"
    },
    typeItemsTextSelected:{
        color:Colors.light.text
    },

    headerTrackingTypes:{
        paddingHorizontal:20,
        width:"100%",
        marginBottom:20,
        boxSizing: "border-box",
    },
    headerTrackingTypesText: {
        fontSize:16,
        fontWeight: "bold",
    },
    lineHeader:{
        width:"100%",
        height:1,
        backgroundColor: "rgba(0,0,0,0.2)",
        marginTop:12,
    },

    textPause:{
        color:"white",
        fontSize:18,
        fontWeight:"bold",
        position:"relative",
    },
    containerPause:{
        flexGrow:1,
        backgroundColor:"rgba(0,0,0,0.6)",
        height:"100%",
        borderRadius:100
    }
});