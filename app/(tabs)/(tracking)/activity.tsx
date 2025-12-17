import {Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import InputTheme from "@/components/InputTheme";
import {Colors} from "@/constants/theme";
import {useEffect, useMemo, useRef, useState} from "react";
import {useImmer} from "use-immer";
import TextArea from "@/components/TextArea";
import {TrackingType, TrackingTypes} from "@/types/trackingTypes";
import BottomSheet, {BottomSheetBackdrop, BottomSheetFlatList, BottomSheetView} from "@gorhom/bottom-sheet";
import ImagePicker from "@/components/ImagePicker";
import {AntDesign, Entypo, FontAwesome, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import RadioButton from "@/components/RadioButton";
import {Visibility} from "@/types/visibility";
import {ButtonOutline} from "@/components/ButtonOutline";
import Button from "@/components/Button";
import {useActivityRun} from "@/providers/activity-tracking-provider";
import {Coordinate} from "@/types/Coordinate";
import {useAuthContext} from "@/hooks/use-auth-contex";
import {durationFormat} from "@/utils/durationFormat";
import TrackingView from "@/components/TrackingView";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

type ActivityState = {
    title: string,
    description: string,
    duration: number,
    type: TrackingType,
    calories: number,
    visibility: Visibility,
    created_at: number,
}

const VISIBILITIES: Visibility[] = [
    {
        name: "private",
        icon: <FontAwesome name="lock" size={24} color="black"/>,
        description: "Hanya bisa di lihat oleh diri kamu sendiri dan tidak bisa di lihat oleh komunitas dan follower kamu"
    },
    {
        name: "follower",
        icon: <Ionicons name="people" size={24} color="black"/>,
        description: "Hanya bisa di lihat oleh diri kamu sendiri dan tidak bisa di lihat oleh komunitas dan follower kamu"
    }, {
        name: "all",
        icon: <Entypo name="globe" size={24} color="black"/>,
        description: "Hanya bisa di lihat oleh diri kamu sendiri dan tidak bisa di lihat oleh komunitas dan follower kamu"
    }
]

export default function CreateActivity() {
    const {activityRun} = useActivityRun();
    const profile = useAuthContext().profile;
    const [activity, setActivity] = useImmer<ActivityState>({
        title: "",
        description: "",
        duration: 0,
        type: TrackingTypes[0],
        calories: 0,
        visibility: VISIBILITIES[1],
        created_at: Date.now()
    });
    const [isDelete,setIsDelete] = useState<boolean>(false);
    const snapPoints = useMemo(() => ["60%", "70%", "100%"], []);
    const IconType = activity.type.icon;
    const bottomSheetTrackingType = useRef<BottomSheet | null>(null);
    const bottomSheetVisibility = useRef<BottomSheet | null>(null);
    const [trackingData, setTrackingData] = useState({
        distance: 0,
        pace: '--:--',
        time: '00:00',
        calories: 0,
        route: [] as { latitude: number; longitude: number }[],
    });
    useEffect(() => {
        if (activityRun) {
            setActivity(draft => {
                draft.duration = activityRun.duration;
                draft.type = activityRun.trackingType;
                draft.calories = activityRun.calorie;
            });

            const calculatedPace = activityRun.pace
            const calculatedCalories = activityRun.calorie

            setTrackingData({
                distance: activityRun.distance,
                pace: calculatedPace,
                time: durationFormat(activityRun.duration),
                calories: calculatedCalories,
                route: activityRun.route || [],
            });
        }
    }, [activityRun, profile.weight]);
    const handleDescriptionChange = (value: string) => {
        setActivity(draft => {
            draft.description = value;
        })
    }

    const handleTitleChange = (text: string) => {
        setActivity(draft => {
            draft.title = text;
        })
    }

    const handlePressType = () => {
        bottomSheetTrackingType.current?.snapToIndex(1)
    }

    function handlePressChangeTrackingType(index: number) {
        setActivity(draft => {
            draft.type = TrackingTypes[index];
        })
    }

    function handleOpenBottomSheetVisibility() {
        bottomSheetVisibility.current?.snapToIndex(1);
    }

    function handleChangeVisibility(index: number) {
        setActivity(draft => {
            draft.visibility = VISIBILITIES[index];
        });
        bottomSheetVisibility.current?.close()
    }

    function handleCreateActivity() {
        console.log('Creating activity:', activity);
    }

    function handleDelete() {
        setIsDelete(true);
    }

    function handleConfirmation(){
        console.log("dihapus")
    }

    function handleCloseModal(){
        setIsDelete(false);
    }

    // @ts-ignore
    return (
        <View style={{flex: 1}}>
            <ScrollView style={styles.container}>
                <View style={styles.trackingSummaryContainer}>
                    <Text style={styles.trackingSummaryTitle}>Ringkasan Aktivitas</Text>

                    <View style={styles.mapContainer}>
                        <TrackingView routeLocation={trackingData.route}/>
                    </View>

                    <View style={styles.metricsContainer}>
                        <View style={styles.metricItem}>
                            <View style={styles.metricIconContainer}>
                                <MaterialCommunityIcons
                                    name="map-marker-distance"
                                    size={24}
                                    color={Colors.light.primary}
                                />
                            </View>
                            <View style={styles.metricTextContainer}>
                                <Text style={styles.metricValue}>
                                    {trackingData.distance.toFixed(2)} km
                                </Text>
                                <Text style={styles.metricLabel}>Jarak</Text>
                            </View>
                        </View>

                        <View style={styles.metricItem}>
                            <View style={styles.metricIconContainer}>
                                <MaterialCommunityIcons
                                    name="speedometer"
                                    size={24}
                                    color={Colors.light.primary}
                                />
                            </View>
                            <View style={styles.metricTextContainer}>
                                <Text style={styles.metricValue}>{trackingData.pace}</Text>
                                <Text style={styles.metricLabel}>Pace</Text>
                            </View>
                        </View>

                        <View style={styles.metricItem}>
                            <View style={styles.metricIconContainer}>
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={24}
                                    color={Colors.light.primary}
                                />
                            </View>
                            <View style={styles.metricTextContainer}>
                                <Text style={styles.metricValue}>{trackingData.time}</Text>
                                <Text style={styles.metricLabel}>Waktu</Text>
                            </View>
                        </View>

                        <View style={styles.metricItem}>
                            <View style={styles.metricIconContainer}>
                                <MaterialCommunityIcons
                                    name="fire"
                                    size={24}
                                    color={Colors.light.primary}
                                />
                            </View>
                            <View style={styles.metricTextContainer}>
                                <Text style={styles.metricValue}>
                                    {trackingData.calories.toFixed(0)}
                                </Text>
                                <Text style={styles.metricLabel}>Kalori</Text>
                            </View>
                        </View>
                    </View>
                </View>
                {/* Form Section */}
                <InputTheme
                    placeholder={"Judul Aktivitas"}
                    style={styles.inputTitle}
                    value={activity.title}
                    onChangeText={handleTitleChange}
                />

                <TextArea
                    placeholder={"Isi dengan pengalaman terbaik anda dengan activity hari ini"}
                    onChangeText={handleDescriptionChange}
                    value={activity.description}
                />

                <Pressable onPress={handlePressType} style={styles.inputType}>
                    <IconType width={26} height={26}/>
                    <Text style={styles.textType}>{activity.type.name}</Text>
                </Pressable>

                <ImagePicker/>

                <View style={styles.visibilitasContainer}>
                    <Text style={styles.visibiltasText}>Visibilitas</Text>
                    <TouchableOpacity
                        onPress={handleOpenBottomSheetVisibility}
                        style={styles.inputType}
                    >
                        {activity.visibility.icon}
                        <Text style={styles.textType}>{activity.visibility.name}</Text>
                    </TouchableOpacity>
                </View>

                <ButtonOutline
                    text={"Hapus"}
                    color={"red"}
                    handlePress={handleDelete}
                    style={styles.deleteButton}
                />
                <Button
                    style={styles.buttonCreate}
                    color={Colors.light.primary}
                    handlePress={handleCreateActivity}
                    label={"Buat Aktivitas"}
                />

            </ScrollView>

            {/* Bottom Sheet untuk Tracking Type */}
            <BottomSheet
                enablePanDownToClose={true}
                ref={bottomSheetTrackingType}
                snapPoints={snapPoints}
                index={-1}
            >
                <BottomSheetFlatList
                    data={TrackingTypes}
                    keyExtractor={(item:any) => item.id}
                    renderItem={({item, index}:{item:any, index:any}) => {
                        const Icon = item.icon;
                        return (
                            <TouchableOpacity
                                onPress={() => handlePressChangeTrackingType(index)}
                                style={[
                                    styles.containerTypeItems,
                                    (item.id == activity.type.id) && styles.typeItemsSelected
                                ]}
                            >
                                <Icon
                                    width={28}
                                    height={28}
                                    fill={(item.id == activity.type.id) ? Colors.light.primary : "#000000"}
                                />
                                <Text
                                    style={[
                                        styles.typeItemsText,
                                        (item.id == activity.type.id) && styles.typeItemsTextSelected
                                    ]}
                                >
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )
                    }}
                    ListHeaderComponent={() => (
                        <View style={styles.headerTrackingTypes}>
                            <Text style={styles.headerTrackingTypesText}>Pilih Tipe Aktivitas</Text>
                            <View style={styles.lineHeader}></View>
                        </View>
                    )}
                />
            </BottomSheet>

            {/* Bottom Sheet untuk Visibility */}
            <BottomSheet
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        {...props}
                        appearsOnIndex={1}
                        disappearsOnIndex={0}
                        opacity={0.5}
                    />
                )}
                enablePanDownToClose={true}
                snapPoints={snapPoints}
                ref={bottomSheetVisibility}
                index={-1}
            >
                <BottomSheetView style={styles.visibilitasBottomSheet}>
                    <View style={[styles.headerTrackingTypes, {paddingHorizontal: 0}]}>
                        <Text style={styles.headerTrackingTypesText}>Pilih Visibilitas</Text>
                        <View style={styles.lineHeader}></View>
                    </View>
                    {VISIBILITIES.map((item, index) => (
                        <View key={index}>
                            <TouchableOpacity
                                onPress={() => handleChangeVisibility(index)}
                                style={styles.visibilityWrapper}
                            >
                                <View style={styles.visibilityTextWrapper}>
                                    <Text style={styles.visibiltyTextTitle}>{item.name}</Text>
                                    <Text style={styles.visibiltyTextDescription}>{item.description}</Text>
                                </View>
                                <RadioButton
                                    checked={item.name === activity.visibility.name}
                                    onPress={() => handleChangeVisibility(index)}
                                />
                            </TouchableOpacity>
                            <View style={styles.lineHeader}></View>
                        </View>
                    ))}
                </BottomSheetView>
            </BottomSheet>
            <DeleteConfirmationModal visible={isDelete} onClose={handleCloseModal} onConfirm={handleConfirmation}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    trackingSummaryContainer: {
        marginBottom: 20,
    },
    trackingSummaryTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        color: Colors.light.text,
    },
    mapContainer: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    metricItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    metricIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    metricTextContainer: {
        flex: 1,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    inputTitle: {
        height: 58,
        marginBottom: 10,
    },
    inputType: {
        height: 48,
        width: "100%",
        borderWidth: 1.5,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        backgroundColor: '#fefefe',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
        marginBottom: 10,
    },
    textType: {
        fontSize: 16,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    containerTypeItems: {
        flexDirection: "row",
        alignItems: "center",
        gap: 25,
        marginHorizontal: 10,
        marginVertical: 3,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 9,
    },
    typeItemsSelected: {
        backgroundColor: "rgba(30,144,255,0.15)",
    },
    typeItemsTextSelected: {
        color: Colors.light.text,
    },
    typeItemsText: {
        fontWeight: "500",
        fontSize: 15,
    },
    headerTrackingTypes: {
        paddingHorizontal: 20,
        width: "100%",
        marginBottom: 20,
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
    visibilitasContainer: {
        marginTop: 6,
        marginBottom: 10,
    },
    visibiltasText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    visibilitasBottomSheet: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    visibilityWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    visibilityTextWrapper: {
        width: "78%",
    },
    visibiltyTextTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "rgba(0,0,0,.8)",
        textTransform: 'capitalize',
        marginBottom: 4,
    },
    visibiltyTextDescription: {
        fontSize: 14,
        color: "rgba(0,0,0,.5)",
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 80,
    },
    deleteButton: {
        flex: 1,
    },
    buttonCreate: {
        flex: 2,
        marginBottom:60,
    },
});