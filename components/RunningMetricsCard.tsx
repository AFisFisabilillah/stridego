import React, {useState} from "react";
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    Layout,
    FadeIn,
    FadeOut,
} from "react-native-reanimated";
import {Ionicons} from "@expo/vector-icons";
import {TrackingType} from "@/types/trackingTypes";

interface RunningData {
    pace: string;
    distance: string;
    time: string;
    trackingType: TrackingType;
    calorie: number
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.92;

const COLLAPSED_HEIGHT = 170;
const EXPANDED_HEIGHT = SCREEN_HEIGHT - 130;

export default function RunningMetricsCard({
                                               time,
                                               distance,
                                               pace,
                                                calorie,
                                               trackingType,
                                           }: RunningData) {
    const [isExpand, setExpand] = useState<boolean>(false);

    // Shared Values
    const heightBox = useSharedValue(COLLAPSED_HEIGHT);
    const widthBox = useSharedValue(CARD_WIDTH);
    const rotateIcon = useSharedValue(0);

    const handleExpand = () => {
        if (!isExpand) {
            // Expand
            heightBox.value = withSpring(EXPANDED_HEIGHT, {damping: 16, stiffness: 90});
            widthBox.value = withSpring(SCREEN_WIDTH * 0.95, {damping: 16, stiffness: 90});
            rotateIcon.value = withTiming(180, {duration: 300});
            setExpand(true);
        } else {
            // Collapse
            heightBox.value = withSpring(COLLAPSED_HEIGHT, {damping: 16, stiffness: 90});
            widthBox.value = withSpring(CARD_WIDTH, {damping: 16, stiffness: 90});
            rotateIcon.value = withTiming(0, {duration: 300});
            setExpand(false);
        }
    };

    const animatedCardStyle = useAnimatedStyle(() => ({
        height: heightBox.value,
        width: widthBox.value,
    }));

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{rotate: `${rotateIcon.value}deg`}],
    }));

    return (
        <Animated.View style={[styles.card, animatedCardStyle]}>
            <TouchableOpacity
                style={styles.touchableArea}
                onPress={handleExpand}
                activeOpacity={0.9}
            >
                {/* Header Section */}
                <View style={styles.headerRow}>
                    <View style={styles.badgeContainer}>
                        <Ionicons name="fitness" size={14} color="#fff"/>
                        <Text style={styles.badgeText}>{trackingType.name}</Text>
                    </View>

                    <Animated.View style={animatedIconStyle}>
                        <Ionicons name="chevron-down" size={20} color="#A1A1AA"/>
                    </Animated.View>
                </View>

                {/* Main Metrics Container */}
                <Animated.View
                    layout={Layout.springify().damping(14)}
                    style={[
                        styles.metricsContainer,
                        isExpand && styles.metricsContainerExpanded
                    ]}
                >
                    <DataColumn
                        label="Jarak"
                        value={distance}
                        unit="km"
                        icon="map-outline"
                        color="#3B82F6"
                        isExpanded={isExpand}
                    />

                    {!isExpand && <View style={styles.divider}/>}
                    {isExpand && <View style={styles.horizontalDivider}/>}

                    <DataColumn
                        label="Waktu"
                        value={time}
                        unit="mnt"
                        icon="timer-outline"
                        color="#F59E0B"
                        isExpanded={isExpand}
                    />

                    {!isExpand && <View style={styles.divider}/>}
                    {isExpand && <View style={styles.horizontalDivider}/>}

                    <DataColumn
                        label="pace"
                        value={pace}
                        unit=""
                        icon="speedometer-outline"
                        color="#10B981"
                        isExpanded={isExpand}
                    />

                    {!isExpand && <View style={styles.divider}/>}
                    {isExpand && <View style={styles.horizontalDivider}/>}

                    <DataColumn
                        label="Calorie"
                        value={`${calorie}`}
                        unit="kkal"
                        icon="speedometer-outline"
                        color="#10B981"
                        isExpanded={isExpand}
                    />
                </Animated.View>

                {/* Konten Tambahan */}
                {isExpand && (
                    <Animated.View
                        entering={FadeIn.duration(600).delay(200)}
                        exiting={FadeOut.duration(200)}
                        style={styles.expandedContent}
                    >
                        <Text style={styles.detailsTitle}>Analisis Performa</Text>
                        <View style={styles.placeholderGraph}>
                            <View style={[styles.bar, {height: '40%'}]}/>
                            <View style={[styles.bar, {height: '70%'}]}/>
                            <View style={[styles.bar, {height: '50%'}]}/>
                            <View style={[styles.bar, {height: '90%'}]}/>
                            <View style={[styles.bar, {height: '60%'}]}/>
                        </View>
                        <Text style={styles.detailsSubtitle}>Statistik lari Anda hari ini.</Text>
                    </Animated.View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

function DataColumn({
                        label,
                        value,
                        unit,
                        icon,
                        color,
                        isExpanded
                    }: {
    label: string;
    value: string;
    unit: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    isExpanded: boolean;
}) {
    return (
        <Animated.View
            layout={Layout.springify().damping(66)}
            style={[
                styles.dataColumn,
                isExpanded && styles.dataColumnExpanded
            ]}
        >
            <View style={[styles.iconCircle, {backgroundColor: `${color}15`}]}>
                <Ionicons name={icon} size={isExpanded ? 20 : 16} color={color}/>
            </View>

            {/* PERBAIKAN DISINI: Menghapus flex: 1 dan typo 'wid' */}
            <View style={[
                {alignItems: 'center', marginTop: 6},
                isExpanded && {
                    alignItems: 'flex-start',
                    marginTop: 0,
                    marginLeft: 12,
                    // Jangan pakai flex: 1 disini
                }
            ]}>
                <Text style={styles.label}>{label}</Text>
                <Text style={[styles.value, isExpanded && {fontSize: 24}]}>
                    {value}<Text style={styles.unit}>{unit}</Text>
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        marginVertical: 10,
        alignSelf: "center",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#F0F0F5",
    },
    touchableArea: {
        flex: 1,
        padding: 16,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#FFFFFF",
        marginLeft: 4,
        textTransform: "uppercase",
    },

    // --- Container Styles ---
    metricsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 5,
    },
    metricsContainerExpanded: {
        flexDirection: "column",
        alignItems: "flex-start", // Gunakan flex-start agar aman
        marginTop: 20,
    },

    // --- Item Styles ---
    dataColumn: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    dataColumnExpanded: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: '100%', // Memaksa lebar penuh
        flex: 0, // Reset flex agar tinggi menyesuaikan konten
        paddingVertical: 8,
    },

    // --- Dividers ---
    divider: {
        width: 1,
        height: 40,
        backgroundColor: '#E4E4E7',
    },
    horizontalDivider: {
        height: 1,
        width: '100%',
        backgroundColor: '#F4F4F5',
        marginVertical: 8,
        marginLeft: 44,
    },

    // --- Typography & Icons ---
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    value: {
        fontSize: 20,
        fontWeight: "800",
        color: "#18181B",
        letterSpacing: -0.5,
    },
    unit: {
        fontSize: 10,
        fontWeight: "600",
        color: "#71717A",
        marginLeft: 2,
    },
    label: {
        fontSize: 11,
        color: "#A1A1AA",
        fontWeight: "500",
        marginBottom: 2,
    },

    // --- Expanded Content ---
    expandedContent: {
        marginTop: 20, // Saya kurangi sedikit agar rapi
        width: '100%',
        backgroundColor: '#FAFAFA',
        padding: 15,
        borderRadius: 12,
    },
    detailsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3F3F46',
        marginBottom: 10,
    },
    placeholderGraph: {
        height: 100,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    bar: {
        width: 8,
        backgroundColor: '#3B82F6',
        borderRadius: 4,
        opacity: 0.8
    },
    detailsSubtitle: {
        marginTop: 10,
        fontSize: 12,
        color: '#71717A',
        textAlign: 'center'
    }
});