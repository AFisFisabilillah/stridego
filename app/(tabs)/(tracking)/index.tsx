import * as Location from "expo-location";
import {LocationAccuracy, LocationObject, LocationSubscription} from "expo-location";
import {useEffect, useMemo, useRef, useState} from "react";
import {Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import BottomSheet, {BottomSheetFlatList, BottomSheetView} from "@gorhom/bottom-sheet";
import {SafeAreaView} from "react-native-safe-area-context";
import {TrackingType, TrackingTypes} from "@/types/trackingTypes";
import {Colors} from "@/constants/theme";
import {Image} from "expo-image";
import PlayIcon from "@/assets/icon/Play";
import {AnimatedView} from "react-native-reanimated/src/component/View";
import {Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import PauseIcon from "@/assets/icon/PauseIcon";
import {AnimatedText} from "react-native-reanimated/src/component/Text";
import StopIcon from "@/assets/icon/StopIcon";
import RunningDataCard from "@/components/RunningMetricsCard";
import TrackingMap from "@/components/TrackingMap";
import {useImmer} from "use-immer";
import getDistanceFromCoordinat from "@/utils/getDistanceFromCoordinat";
import {durationFormat} from "@/utils/durationFormat";

export default function TrackingRun() {
    const [location, setLocation] = useState<Location.LocationObject>(null);
    const [errorPermision, setErrorPermision] = useState(false);
    const [trackingType, setTrackingType] = useState<TrackingType>(TrackingTypes[0]);
    const [isStarting, setStarting] = useState<boolean>(false);
    const [isPause, setPause] = useState<boolean>(false);
    const Icon = trackingType.icon;
    const bottomSheetPermision = useRef<BottomSheet | null>(null);
    const bottomSHeetTrackingType = useRef<BottomSheet | null>(null);
    const snapPoints = useMemo(() => ["60%", "70%", "100%"], []);

    const [distance , setDistance] = useState<number>(0);
    const [routeCoordinates, setRouteCoordinat] = useImmer<{latitude:number, longitude:number}[]>([]);
    const [duration, setDuration] = useState<number>(0);
    const locationSubcription = useRef<LocationSubscription | null>(null);
    const currentRunningData = {
        speed: "8.5",
        distance: distance.toFixed(2),
        time: durationFormat(duration),
        trackingType:trackingType
    };

    // UI THREAD STATE
    const playFLex = useSharedValue<number>(0);
    const playWidth = useSharedValue<number>(70);
    const playOpacity = useSharedValue<number>(1);
    const sideButtonWidth = useSharedValue<number>(60);
    const sideButtonScale = useSharedValue<number>(1);
    const textPauseWidth = useSharedValue<number>(0);
    const textPauseMarginLeft = useSharedValue<number>(0);
    const textPauseScale = useSharedValue<number>(0);
    const finishFlex = useSharedValue<number>(0);
    const finishScale = useSharedValue<number>(0);


    //@ts-ignore
    const finishButtonAnimationStyle = useAnimatedStyle(() => {
        return {
            flex: finishFlex.value,
            transform: [{scale: finishScale.value}],
        }
    })

    const playAnimationStyle = useAnimatedStyle(() => {
        return {
            width: playWidth.value,
            flex: playFLex.value,
            opacity: playOpacity.value,
        }
    });

    //@ts-ignore
    const sideButtonAnimationStyle = useAnimatedStyle(() => {
        return {
            width: sideButtonWidth.value,
            transform: [{scale: sideButtonScale.value}]
        }
    });

    //@ts-ignore
    const textPauseStyle = useAnimatedStyle(() => {
        return {
            width: textPauseWidth.value,
            marginLeft: textPauseMarginLeft.value,
            transform: [{scale: textPauseScale.value}]
        }
    });

    useEffect(() => {
        let interval: number;
        if (isStarting && !isPause) {
            interval = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isStarting, isPause]);

    useEffect(() => {
        const startTracking = async ()=>{

            locationSubcription.current = await Location.watchPositionAsync({
                accuracy : LocationAccuracy.BestForNavigation,
                timeInterval:500
            }, (location:LocationObject)=>{
                setLocation(location);
                setRouteCoordinat(draft => {

                    const newPoint = {
                        latitude:location.coords.latitude,
                        longitude:location.coords.longitude,
                    }

                    if(draft.length > 0 ){
                        const lastPoint = draft[draft.length - 1];
                        const distance = getDistanceFromCoordinat(lastPoint.latitude, lastPoint.longitude, newPoint.latitude, newPoint.longitude);
                        setDistance(prevState => prevState+distance)
                    }
                    draft.push(newPoint);
                })
            })
        }

        const stopTracking = ()=>{
            if (locationSubcription.current) {
                locationSubcription.current?.remove();
                locationSubcription.current = null;
            }
        }
        if(isStarting && !isPause){
            startTracking();
        }else{
            stopTracking();
        }
    }, [isPause, isStarting]);

    useEffect(() => {
        if (errorPermision) {
            bottomSheetPermision.current?.snapToIndex(1);
        }
    }, [errorPermision]);

    // Meminta izin unutk mengakses lokasi
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

    function handlePLayPress() {
        if (!isStarting) {
            sideButtonWidth.value = withTiming(0, {duration: 200});
            sideButtonScale.value = withTiming(0, {duration: 200});
            playWidth.value = withTiming(0, {duration: 200});
            playFLex.value = withTiming(1, {
                duration: 1000,
                easing: Easing.bezier(0.85, 0.27, 0.36, 0.82),
                reduceMotion: ReduceMotion.System,
            });
            textPauseWidth.value = withTiming(39, {duration: 100});
            textPauseMarginLeft.value = withTiming(15, {duration: 1300});
            textPauseScale.value = withTiming(1, {duration: 1200});

            setStarting(true);
        } else if (isStarting || isPause) {
            if (isPause && isStarting) {
                setPause(false);
                finishFlex.value = withTiming(0, {
                    duration: 1000,
                    easing: Easing.bezier(0.85, 0.27, 0.36, 0.82),
                    reduceMotion: ReduceMotion.System,
                });
                finishScale.value = withTiming(0, {
                    duration: 1000,
                    easing: Easing.bezier(0.85, 0.27, 0.36, 0.82),
                    reduceMotion: ReduceMotion.System,
                });
            } else {
                finishFlex.value = withTiming(1, {
                    duration: 1000,
                    easing: Easing.bezier(0.85, 0.27, 0.36, 0.82),
                    reduceMotion: ReduceMotion.System,
                });
                finishScale.value = withTiming(1, {
                    duration: 1000,
                    easing: Easing.bezier(0.85, 0.27, 0.36, 0.82),
                    reduceMotion: ReduceMotion.System,
                });
                textPauseMarginLeft.value = withTiming(5, {duration: 300});
                setPause(true);
            }

        }
    }

    function handlerPressTrackingType() {
        bottomSHeetTrackingType.current?.snapToIndex(1);
    }

    function handlePressChangeTrackingType(index: number) {
        setTrackingType(TrackingTypes[index]);
        bottomSHeetTrackingType.current?.close();
    }

    return (
        <SafeAreaView style={styles.container}>
            <TrackingMap routeLocation={routeCoordinates} currentLocation={location}/>
            <RunningDataCard speed={currentRunningData.speed} distance={currentRunningData.distance} time={currentRunningData.time} trackingType={currentRunningData.trackingType} />
            <View style={styles.containerButton}>
                <AnimatedView style={[styles.containerIcon, styles.buttonTrackingTypes, sideButtonAnimationStyle]}
                >
                    <TouchableOpacity onPress={handlerPressTrackingType}>
                        <Icon width={30} height={30} fill={Colors.light.primary}/>
                    </TouchableOpacity>
                </AnimatedView>
                <AnimatedView style={[styles.containerStart, playAnimationStyle]}>
                    <Pressable style={styles.pressebleStart} onPress={handlePLayPress}>
                        {isStarting && !isPause
                            ? <PauseIcon width={30} height={30} fill={"#ffffff"}/>
                            : <PlayIcon height={30} width={30}/>}
                        <AnimatedText style={[styles.textPause, textPauseStyle]}>Jeda</AnimatedText>
                    </Pressable>
                </AnimatedView>
                <AnimatedView style={[styles.containerIcon, sideButtonAnimationStyle]}></AnimatedView>
                {/*FInish*/}
                {isStarting && <AnimatedView style={[styles.containerFinish, finishButtonAnimationStyle]}>{isPause &&
                    <StopIcon width={30} height={30} fill={"#ffffff"}/>}</AnimatedView>
                }
            </View>
            <BottomSheet ref={bottomSheetPermision} snapPoints={snapPoints} index={-1}>
                <BottomSheetView style={{padding: 20}}>
                    <Image style={styles.iamgePermision} alt={"gambar sda"}
                           source={require("../../../assets/location-permission.svg")}/>
                    <Text style={styles.textPermission}>Izinkan Aplikasi untuk Mengakses Lokasi anda</Text>
                </BottomSheetView>
            </BottomSheet>
            <BottomSheet enablePanDownToClose={true} ref={bottomSHeetTrackingType} snapPoints={snapPoints} index={-1}>
                <BottomSheetFlatList
                    data={TrackingTypes}
                    keyExtractor={item => item.id}
                    renderItem={({item, index}) => {
                        const Icon = item.icon;
                        return (
                            <TouchableOpacity onPress={event => {
                                handlePressChangeTrackingType(index)
                            }}
                                              style={[styles.containerTypeItems, (item.id == trackingType.id) && styles.typeItemsSelected]}>
                                <Icon width={28} height={28}
                                      fill={(item.id == trackingType.id) ? Colors.light.primary : "#000000"}/>
                                <Text
                                    style={[styles.typeItemsText, (item.id == trackingType.id) && styles.typeItemsTextSelected]}>{item.name}</Text>
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
//@ts-ignore
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
        position:"relative",
        marginHorizontal: "auto",
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 40,
        borderRadius: 100,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        gap: 4
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
        width: 70,
        height: 70,
        borderRadius: 80,
        backgroundColor: Colors.light.primary,
    },

    pressebleStart: {
        width: "100%",
        height: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
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
        gap: 25,
        marginHorizontal: 10,
        marginVertical: 3,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 9
    },

    typeItemsText: {
        fontWeight: "500",
        fontSize: 15
    },
    typeItemsSelected: {
        backgroundColor: "rgba(30,144,255,0.15)"
    },
    typeItemsTextSelected: {
        color: Colors.light.text
    },

    headerTrackingTypes: {
        paddingHorizontal: 20,
        width: "100%",
        marginBottom: 20,
        boxSizing: "border-box",
    },
    headerTrackingTypesText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    lineHeader: {
        width: "100%",
        height: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        marginTop: 12,
    },

    textPause: {
        width: 0,
        transform: [{scale: 0}],
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        position: "relative",
    },
    containerPause: {
        flexGrow: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        height: "100%",
        borderRadius: 100
    },

    containerFinish: {
        flex: 0,
        width: 0,
        transform: [{scale: 0}],
        height: "100%",
        borderRadius: 100,
        backgroundColor: "rgba(0,0,0,0.8)",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
});