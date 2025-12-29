// components/ExerciseSelectionModal.tsx
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StyleSheet,
    FlatList,
} from 'react-native';
import { Colors } from '@/constants/theme';
import {Exercise} from "@/types/challenge";
import LottieView from "lottie-react-native";


interface ExerciseSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (selectedIds: string[]) => void;
    availableExercises: Exercise[];
    selectedExerciseIds: string[];
}

const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = ({
                                                                           visible,
                                                                           onClose,
                                                                           onSelect,
                                                                           availableExercises,
                                                                           selectedExerciseIds,
                                                                       }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>(selectedExerciseIds);
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

    const muscleGroups = Array.from(
        new Set(availableExercises.map(e => e.otot).filter(Boolean))
    ) as string[];

    const filteredExercises = availableExercises.filter(exercise => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exercise.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMuscle = !selectedMuscleGroup || exercise.otot === selectedMuscleGroup;
        return matchesSearch && matchesMuscle;
    });

    const toggleExercise = (exerciseId: string) => {
        if (selectedIds.includes(exerciseId)) {
            setSelectedIds(selectedIds.filter(id => id !== exerciseId));
        } else {
            setSelectedIds([...selectedIds, exerciseId]);
        }
    };

    const handleConfirm = () => {
        onSelect(selectedIds);
        setSelectedIds([]);
        setSearchQuery('');
        setSelectedMuscleGroup(null);
    };

    const handleCancel = () => {
        setSelectedIds(selectedExerciseIds);
        setSearchQuery('');
        setSelectedMuscleGroup(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleCancel}
        >
            <View style={styles.modalContainer}>
                {/* Header */}
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Exercises</Text>
                    <TouchableOpacity onPress={handleCancel}>
                        <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={Colors.light.gray}
                    />
                </View>

                {/* Muscle Group Filter */}
                {muscleGroups.length > 0 && (
                    <View style={{ height: 72 }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.muscleGroupContainer}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.muscleGroupButton,
                                    !selectedMuscleGroup && styles.muscleGroupButtonSelected,
                                ]}
                                onPress={() => setSelectedMuscleGroup(null)}
                            >
                                <Text
                                    style={[
                                        styles.muscleGroupText,
                                        !selectedMuscleGroup && styles.muscleGroupTextSelected,
                                    ]}
                                >
                                    All
                                </Text>
                            </TouchableOpacity>
                            {muscleGroups.map((muscleGroup) => (
                                <TouchableOpacity
                                    key={muscleGroup}
                                    style={[
                                        styles.muscleGroupButton,
                                        selectedMuscleGroup === muscleGroup && styles.muscleGroupButtonSelected,
                                    ]}
                                    onPress={() => setSelectedMuscleGroup(muscleGroup)}
                                >
                                    <Text
                                        style={[
                                            styles.muscleGroupText,
                                            selectedMuscleGroup === muscleGroup && styles.muscleGroupTextSelected,
                                        ]}
                                    >
                                        {muscleGroup}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Exercise List */}
                <FlatList
                    data={filteredExercises}
                    keyExtractor={(item) => item.id}
                    style={styles.exerciseList}
                    contentContainerStyle={styles.exerciseListContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.exerciseItem,
                                selectedIds.includes(item.id.toString()) && styles.exerciseItemSelected,
                            ]}
                            onPress={() => toggleExercise(item.id.toString())}
                        >
                            <View style={styles.exerciseItemContent}>
                                <View style={styles.lottieContainer}>
                                    <LottieView
                                        source={{uri:item.image}}
                                        autoPlay
                                        loop
                                        style={{ width: 50, height: 50 }}
                                    />
                                </View>
                                <View style={styles.exerciseInfo}>
                                    <Text style={styles.exerciseName}>{item.name}</Text>
                                    {item.otot && (
                                        <Text style={styles.exerciseMuscle}>{item.otot}</Text>
                                    )}
                                    {item.description && (
                                        <Text style={styles.exerciseDescription} numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.radioButtonContainer}>
                                    <View
                                        style={[
                                            styles.radioButton,
                                            selectedIds.includes(item.id.toString()) && styles.radioButtonSelected,
                                        ]}
                                    >
                                        {selectedIds.includes(item.id.toString()) && (
                                            <View style={styles.radioButtonInner} />
                                        )}
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                No exercises found
                            </Text>
                        </View>
                    }
                />

                {/* Footer */}
                <View style={styles.modalFooter}>
                    <View style={styles.selectionInfo}>
                        <Text style={styles.selectionCount}>
                            {selectedIds.length} selected
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            selectedIds.length === 0 && styles.confirmButtonDisabled,
                        ]}
                        onPress={handleConfirm}
                        disabled={selectedIds.length === 0}
                    >
                        <Text style={styles.confirmButtonText}>
                            Add Selected ({selectedIds.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.gray + '30',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
    },
    closeButton: {
        fontSize: 24,
        color: Colors.light.gray,
        padding: 4,
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: Colors.light.gray,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: Colors.light.text,
        backgroundColor: Colors.light.background,
    },
    muscleGroupContainer: {
        paddingHorizontal: 16,
        paddingVertical:18
    },
    muscleGroupButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.gray,
        marginRight: 8,
        height:40

    },
    muscleGroupButtonSelected: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    muscleGroupText: {
        fontSize: 14,
        color: Colors.light.text,
    },
    muscleGroupTextSelected: {
        color: Colors.light.background,
        fontWeight: '500',
    },
    exerciseList: {
        flex: 1,
    },
    exerciseListContent: {
        padding: 16,
    },
    exerciseItem: {
        backgroundColor: Colors.light.background,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.gray + '30',
    },
    exerciseItemSelected: {
        borderColor: Colors.light.primary,
        backgroundColor: Colors.light.primary + '10',
    },
    exerciseItemContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    exerciseInfo: {
        flex: 1,
        marginRight: 12,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.light.text,
        marginBottom: 4,
    },
    exerciseMuscle: {
        fontSize: 14,
        color: Colors.light.primary,
        marginBottom: 4,
        fontWeight: '500',
    },
    exerciseDescription: {
        fontSize: 12,
        color: Colors.light.gray,
        lineHeight: 16,
    },
    radioButtonContainer: {
        paddingLeft: 8,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.light.gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: Colors.light.primary,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.light.primary,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyStateText: {
        color: Colors.light.gray,
        fontSize: 14,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.light.gray + '30',
        backgroundColor: Colors.light.background,
    },
    selectionInfo: {
        flex: 1,
    },
    selectionCount: {
        fontSize: 14,
        color: Colors.light.text,
    },
    confirmButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        marginLeft: 16,
    },
    confirmButtonDisabled: {
        backgroundColor: Colors.light.gray,
        opacity: 0.6,
    },
    confirmButtonText: {
        color: Colors.light.background,
        fontSize: 14,
        fontWeight: '600',
    },
    lottieContainer: {
        marginRight: 12,
    },
    lottiePlaceholder: {
        backgroundColor: Colors.light.primary + '10',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ExerciseSelectionModal;