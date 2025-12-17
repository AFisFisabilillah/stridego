import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    Modal,
    Pressable,
    Platform,
} from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {Colors} from '@/constants/theme';
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import {FileInfo} from "expo-file-system/legacy";

type ImagePickerProps = {
    maxSelection?: number;
    onImagesSelected?: (images: SelectedImage[]) => void;
    initialImages?: SelectedImage[];
};

export type SelectedImage = {
    uri: string;
    fileName?: string;
    fileSize?: number;
    type?: string;
    base64?: string;
};

const ImagePicker: React.FC<ImagePickerProps> = ({
                                                     maxSelection = 10,
                                                     onImagesSelected,
                                                     initialImages = [],
                                                 }) => {
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(initialImages);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const {status} = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Izin Diperlukan',
                    'Maaf, kami membutuhkan izin akses ke galeri foto untuk memilih gambar.',
                );
                return false;
            }
        }
        return true;
    };

    const getFileInfo = async (uri: string) => {
        try {
            const fileInfo:FileInfo = await FileSystem.getInfoAsync(uri);
            return {
                size: fileInfo?.size,
                name: uri.split('/').pop() || 'image.jpg',
            };
        } catch (error) {
            console.error('Error getting file info:', error);
            return {size: 0, name: 'image.jpg'};
        }
    };

    const pickImages = async () => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            const result = await ExpoImagePicker.launchImageLibraryAsync({
                mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: maxSelection - selectedImages.length,
                quality: 0.8,
                allowsEditing: false,
                base64: true,
            });

            if (result.canceled) {
                console.log('User cancelled image picker');
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const newImagesPromises = result.assets.map(async (asset) => {
                    const fileInfo = await getFileInfo(asset.uri);
                    return {
                        uri: asset.uri,
                        fileName: fileInfo.name,
                        fileSize: fileInfo.size,
                        type: asset.mimeType,
                        base64: asset.base64,
                    } as SelectedImage;
                });

                const newImages = await Promise.all(newImagesPromises);
                const updatedImages = [...selectedImages, ...newImages];

                const finalImages = updatedImages.slice(-maxSelection);

                setSelectedImages(finalImages);

                if (onImagesSelected) {
                    onImagesSelected(finalImages);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal memilih gambar');
            console.error('Image picker error:', error);
        }
    };

    const removeImage = (index: number) => {
        const updatedImages = selectedImages.filter((_, i) => i !== index);
        setSelectedImages(updatedImages);

        if (onImagesSelected) {
            onImagesSelected(updatedImages);
        }
    };

    const openPreview = (uri: string) => {
        setPreviewImage(uri);
    };

    const closePreview = () => {
        setPreviewImage(null);
    };

    const formatFileSize = (bytes: number | undefined): string => {
        if (!bytes) return '0 KB';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.pickerButton} onPress={pickImages}>
                <FontAwesome name="file-photo-o" size={24} color={Colors.light.primary}/>
                <Text style={styles.pickerButtonText}>Pilih Gambar</Text>
                <Text style={styles.pickerSubText}>
                    {selectedImages.length}/{maxSelection} gambar terpilih
                </Text>
                <Text style={styles.pickerHint}>
                    Tahan untuk memilih banyak gambar
                </Text>
            </TouchableOpacity>

            {selectedImages.length > 0 && (
                <View style={styles.imagesContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}>
                        {selectedImages.map((image, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <TouchableOpacity onPress={() => openPreview(image.uri)}>
                                    <Image source={{uri: image.uri}} style={styles.image}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeImage(index)}>
                                    <AntDesign name="close" size={24} color="white"/></TouchableOpacity>
                                <View style={styles.imageInfo}>
                                    {image.fileName && (
                                        <Text style={styles.fileName} numberOfLines={1}>
                                            {image.fileName.length > 15
                                                ? image.fileName.substring(0, 15) + '...'
                                                : image.fileName}
                                        </Text>
                                    )}
                                    {image.fileSize && (
                                        <Text style={styles.fileSize}>
                                            {formatFileSize(image.fileSize)}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}

                        {selectedImages.length < maxSelection && (
                            <TouchableOpacity style={styles.addMoreButton} onPress={pickImages}>
                                <AntDesign name="file-add" size={24} color={Colors.light.primary}/>
                                <Text style={styles.addMoreText}>Tambah</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            )}

            {/* Modal untuk preview gambar */}
            <Modal
                visible={!!previewImage}
                transparent={true}
                animationType="fade"
                onRequestClose={closePreview}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalBackground}
                        activeOpacity={1}
                        onPress={closePreview}>
                        <View style={styles.modalContent}>
                            {previewImage && (
                                <Image
                                    source={{uri: previewImage}}
                                    style={styles.previewImage}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closePreviewButton} onPress={closePreview}>
                        <AntDesign name="close" size={24} color="white"/></TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    pickerButton: {
        borderWidth: 2,
        borderColor: Colors.light.primary,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(30, 144, 255, 0.05)',
    },
    pickerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.primary,
        marginTop: 8,
    },
    pickerSubText: {
        fontSize: 12,
        color: Colors.light.secondary,
        marginTop: 4,
    },
    pickerHint: {
        fontSize: 11,
        color: Colors.light.secondary,
        marginTop: 2,
        fontStyle: 'italic',
    },
    imagesContainer: {
        marginTop: 16,
    },
    scrollContent: {
        paddingRight: 20,
    },
    imageWrapper: {
        position: 'relative',
        width: 100,
        marginRight: 12,
        marginTop:12
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: Colors.light.error,
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    imageInfo: {
        marginTop: 4,
    },
    fileName: {
        fontSize: 10,
        color: Colors.light.text,
        textAlign: 'center',
        fontWeight: '500',
    },
    fileSize: {
        fontSize: 9,
        color: Colors.light.secondary,
        textAlign: 'center',
        marginTop: 2,
    },
    addMoreButton: {
        width: 100,
        height: 100,
        borderWidth: 1,
        marginTop: 12,
        borderColor: Colors.light.primary,
        borderStyle: 'dashed',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(30, 144, 255, 0.05)',
    },
    addMoreText: {
        fontSize: 12,
        color: Colors.light.primary,
        marginTop: 4,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '70%',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    closePreviewButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: "black",
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ImagePicker;