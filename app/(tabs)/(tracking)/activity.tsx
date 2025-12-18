import {Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Animated} from "react-native";
import InputTheme from "@/components/InputTheme";
import {Colors} from "@/constants/theme";
import {useEffect, useMemo, useRef, useState} from "react";
import {useImmer} from "use-immer";
import TextArea from "@/components/TextArea";
import {TrackingType, TrackingTypes} from "@/types/trackingTypes";
import BottomSheet, {BottomSheetBackdrop, BottomSheetFlatList, BottomSheetView} from "@gorhom/bottom-sheet";
import ImagePicker, {SelectedImage} from "@/components/ImagePicker";
import {AntDesign, Entypo, FontAwesome, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import RadioButton from "@/components/RadioButton";
import {Visibility} from "@/types/visibility";
import {ButtonOutline} from "@/components/ButtonOutline";
import Button from "@/components/Button";
import {useActivityRun} from "@/providers/activity-tracking-provider";
import {useAuthContext} from "@/hooks/use-auth-contex";
import {durationFormat} from "@/utils/durationFormat";
import TrackingView from "@/components/TrackingView";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import {Activity} from "@/types/activities";
import {createActivityRunning} from "@/services/activity.service";
import SuccessAnimation from "@/components/SuccessAnimation";
import {useRouter} from "expo-router";

type ActivityState = {
    title: string,
    description: string,
    duration: number,
    type: TrackingType,
    calories: number,
    visibility: Visibility,
    created_at: number,
    images: SelectedImage[]
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
    const {activityRun, clearActivity} = useActivityRun();
    const profile = useAuthContext().profile;
    const [activity, setActivity] = useImmer<ActivityState>({
        title: "",
        description: "",
        duration: 0,
        type: TrackingTypes[0],
        calories: 0,
        visibility: VISIBILITIES[1],
        created_at: Date.now(),
        images: []
    });

    // State untuk modal dan notifikasi
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [isErrorModalVisible, setIsErrorModalVisible] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const successAnimation = useRef(new Animated.Value(0)).current;
    const router = useRouter();
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

    // Fungsi untuk menampilkan notifikasi sukses
    const showSuccessAnimation = () => {
        setIsSuccess(true);
        Animated.sequence([
            Animated.timing(successAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(successAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsSuccess(false);
            router.replace("/(tabs)");
        });
    };

    // Fungsi untuk menampilkan modal error
    const showErrorModal = (message: string) => {
        setErrorMessage(message);
        setIsErrorModalVisible(true);
    };

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

    async function handleCreateActivity() {
        // Validasi form
        if (!activity.title.trim()) {
            showErrorModal("Judul aktivitas tidak boleh kosong");
            return;
        }

        if (!activityRun) {
            showErrorModal("Data aktivitas tidak ditemukan");
            return;
        }

        console.log('Creating activity:', activity);
        const createActivity: Activity = {
            title: activity.title,
            type: activity.type.name,
            calorie: activityRun?.calorie || 0,
            description: activity.description,
            duration: activityRun?.duration || 0,
            visibility: activity.visibility.name,
            user_id: profile.id
        }

        setIsLoading(true);

        try {
            const response = await createActivityRunning(
                createActivity,
                {
                    pace: activityRun?.pace || "",
                    distance: activityRun?.distance || 0,
                    route: activityRun?.route || []
                },
                activity.images
            );

            showSuccessAnimation();

            // Reset form setelah berhasil
            setTimeout(() => {
                setActivity(draft => {
                    draft.title = "";
                    draft.description = "";
                    draft.images = [];
                });
            }, 2000);
            clearActivity()
        } catch (error: any) {
            console.log(error);
            // Tampilkan error berdasarkan jenis error
            let errorMsg = "Gagal menyimpan aktivitas. Silakan coba lagi.";

            if (error.message) {
                errorMsg = error.message;
            } else if (error.code === 'NETWORK_ERROR') {
                errorMsg = "Koneksi internet terputus. Periksa koneksi Anda.";
            } else if (error.message?.includes('storage')) {
                errorMsg = "Gagal mengupload gambar. Pastikan gambar tidak terlalu besar.";
            }

            showErrorModal(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    function handleDelete() {
        setIsDelete(true);
    }

    function handleConfirmation() {
        console.log("dihapus")
    }

    function handleCloseModal() {
        setIsDelete(false);
    }

    function handleCloseErrorModal() {
        setIsErrorModalVisible(false);
    }

    function handleSelectedImage(images: SelectedImage[]) {
        setActivity(draft => {
            draft.images = images
        })
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

                <ImagePicker maxSelection={4} onImagesSelected={handleSelectedImage}/>

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
                    label={isLoading ? "Menyimpan..." : "Buat Aktivitas"}
                    disabled={isLoading}
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
                    keyExtractor={(item: any) => item.id}
                    renderItem={({item, index}: { item: any, index: any }) => {
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

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                visible={isDelete}
                onClose={handleCloseModal}
                onConfirm={handleConfirmation}
            />

            {/* Error Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isErrorModalVisible}
                onRequestClose={handleCloseErrorModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.errorModalContainer}>
                        <View style={styles.errorIconContainer}>
                            <Ionicons name="alert-circle" size={60} color="#ff4444" />
                        </View>
                        <Text style={styles.errorModalTitle}>Terjadi Kesalahan</Text>
                        <Text style={styles.errorModalMessage}>{errorMessage}</Text>
                        <TouchableOpacity
                            style={styles.errorModalButton}
                            onPress={handleCloseErrorModal}
                        >
                            <Text style={styles.errorModalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Success Animation Overlay */}
            {isSuccess && (
                <SuccessAnimation
                    message="Aktivitas Berhasil Disimpan!"
                    onAnimationComplete={() => setIsSuccess(false)}
                />
            )}
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
        marginBottom: 60,
    },
    // Modal Error Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorModalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    errorIconContainer: {
        marginBottom: 16,
    },
    errorModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    errorModalMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    errorModalButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 120,
    },
    errorModalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    // Success Toast Styles
    successToast: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        padding: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    successToastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    successToastText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});