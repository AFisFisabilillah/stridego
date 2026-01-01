import React, {useMemo, useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

import {Exercise,ExerciseDay} from "@/types/challenge";
import LottieView from "lottie-react-native";
import {Colors} from "@/constants/theme";
import BottomSheet, {BottomSheetView} from "@gorhom/bottom-sheet";


interface ExerciseCardProps {
    exercise: Exercise;
    onPress?: () => void;
    duration? : number;
    reps?:number;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onPress,reps = 0,duration = 0 }) => {

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.contentContainer}>

                {/* Lottie */}
                <View style={styles.lottieContainer}>
                    <LottieView
                        source={{ uri: exercise.image }}
                        autoPlay
                        loop
                        style={styles.lottie}
                    />
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.name} numberOfLines={1}>
                        {exercise.name}
                    </Text>

                    <Text style={styles.description} numberOfLines={2}>
                        {exercise.description}
                    </Text>

                    {/* Metrics */}
                    <View style={styles.metricsContainer}>
                        {reps > 0 && (
                            <View style={styles.metricItem}>
                                <Text style={styles.metricValue}>{reps}</Text>
                            </View>
                        )}

                        {duration > 0 && (
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>DURASI</Text>
                                <Text style={styles.metricValue}>
                                    {duration}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lottieContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    detailsContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 12,
        lineHeight: 20,
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        backgroundColor: Colors.light.secondary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    metricLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
        marginRight: 4,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});

export default ExerciseCard;