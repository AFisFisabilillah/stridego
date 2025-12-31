import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {supabase} from '@/lib/supabase';
import {AntDesign, FontAwesome, FontAwesome6} from "@expo/vector-icons";
import {useAuthContext} from "@/hooks/use-auth-contex";
import * as FileSystem from 'expo-file-system';
import {decode} from 'base64-arraybuffer';

interface Profile {
    username: string;
    fullname: string;
    gender: string;
    weight: number;
    height: number;
    avatar_url: string;
}

interface UpdateProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onUpdateSuccess?: () => void;
    initialProfile: Profile;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
                                                                   visible,
                                                                   onClose,
                                                                   onUpdateSuccess,
                                                                   initialProfile,
                                                               }) => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profile, setProfile] = useState<Profile>(initialProfile);
    const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
    const [localImage, setLocalImage] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<ImagePicker.PermissionStatus>();
    const userId = useAuthContext().session?.user.id
    const bufferImage = useRef<string>("");

    const BUCKET_NAME = 'profile';

    useEffect(() => {
        if (visible) {
            setProfile(initialProfile);
            setErrors({});
            setLocalImage(null);
            checkPermission();
        }
    }, [visible, initialProfile]);

    const checkPermission = async () => {
        const {status} = await ImagePicker.getMediaLibraryPermissionsAsync();
        setPermissionStatus(status);
    };

    const requestPermission = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setPermissionStatus(status);
        return status === 'granted';
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof Profile, string>> = {};

        if (!profile.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!profile.fullname.trim()) {
            newErrors.fullname = 'Fullname is required';
        }

        if (!profile.gender.trim()) {
            newErrors.gender = 'Gender is required';
        }

        if (!profile.weight || profile.weight <= 0) {
            newErrors.weight = 'Weight must be greater than 0';
        }

        if (!profile.height || profile.height <= 0) {
            newErrors.height = 'Height must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const pickImage = async () => {
        try {
            // Check and request permission if needed
            if (permissionStatus !== 'granted') {
                const granted = await requestPermission();
                if (!granted) {
                    Alert.alert(
                        'Permission Required',
                        'Please allow access to your photo library to upload profile pictures.',
                        [{text: 'OK'}]
                    );
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: true,
            });


            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                // @ts-ignore
                bufferImage.current = asset.base64;
                setLocalImage(asset.uri);
                setProfile({...profile, avatar_url: ''});
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            const {status} = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please allow access to camera to take photos.',
                    [{text: 'OK'}]
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: false,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setLocalImage(asset.uri);
                setProfile({...profile, avatar_url: ''});
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const uploadImage = async (fileUri: string, fileName: string): Promise<string> => {
        try {
            setUploading(true);

            if (!userId) {
                throw new Error('User not authenticated');
            }

            const fileExt = fileName.split('.').pop()?.toLowerCase() || 'jpg';
            const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

            if (!validExtensions.includes(fileExt)) {
                throw new Error('Invalid file type. Please use JPG, PNG, GIF, or WebP.');
            }

            const base64 = bufferImage.current;

            const arrayBuffer = decode(base64);

            const newFileName = `${userId}/${Date.now()}.${fileExt}`;

            // Tentukan Content Type (MIME type) agar browser tahu ini gambar
            const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

            // 5. Upload ke Supabase Storage
            const {data, error: uploadError} = await supabase.storage
                .from(BUCKET_NAME)
                .upload(newFileName, arrayBuffer, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: contentType, // Penting: set content type manual
                });

            if (uploadError) {
                throw uploadError;
            }

            // 6. Dapatkan Public URL
            const {data: {publicUrl}} = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(newFileName);

            return publicUrl;

        } catch (error: any) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };
    const handleUpdateProfile = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {

            if (!userId) {
                throw new Error('User not authenticated');
            }

            let avatarUrl = profile.avatar_url;

            if (localImage) {
                const fileName = localImage.split('/').pop() || 'avatar.jpg';
                avatarUrl = await uploadImage(localImage, fileName);
                console.log("avatar_url:", avatarUrl);
                if (profile.avatar_url && profile.avatar_url !== avatarUrl) {
                    await deleteOldAvatar(profile.avatar_url);
                }
            }

            const {error} = await supabase
                .from('profiles')
                .update({
                    // @ts-ignore
                    username: profile.username,
                    // @ts-ignore
                    fullname: profile.fullname,
                    // @ts-ignore
                    gender: profile.gender,
                    // @ts-ignore
                    weight: profile.weight,
                    // @ts-ignore
                    height: profile.height,
                    // @ts-ignore
                    avatar_url: avatarUrl,
                })
                .eq('id', userId);

            if (error) {
                throw error;
            }

            Alert.alert('Success', 'Profile updated successfully');
            onUpdateSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const deleteOldAvatar = async (avatarUrl: string) => {
        try {
            const path = avatarUrl.split('/').slice(-2).join('/'); // Get user_id/filename
            const {error} = await supabase.storage
                .from(BUCKET_NAME)
                .remove([path]);

            if (error && !error.message.includes('not found')) {
                console.error('Error deleting old avatar:', error);
            }
        } catch (error) {
            console.error('Error deleting old avatar:', error);
        }
    };

    const removeAvatar = async () => {
        try {
            Alert.alert(
                'Remove Avatar',
                'Are you sure you want to remove your profile picture?',
                [
                    {text: 'Cancel', style: 'cancel'},
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: async () => {
                            if (profile.avatar_url) {
                                await deleteOldAvatar(profile.avatar_url);
                            }
                            setLocalImage(null);
                            setProfile({...profile, avatar_url: ''});
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error removing avatar:', error);
            Alert.alert('Error', 'Failed to remove avatar');
        }
    };

    const renderInput = (
        label: string,
        field: keyof Profile,
        placeholder: string,
        keyboardType: 'default' | 'numeric' = 'default',
        multiline = false
    ) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    errors[field] && styles.inputError,
                    multiline && styles.multilineInput,
                ]}
                value={profile[field]?.toString()}
                onChangeText={(text) => {
                    const value = keyboardType === 'numeric' ? Number(text) : text;
                    setProfile({...profile, [field]: value});
                    if (errors[field]) {
                        setErrors({...errors, [field]: undefined});
                    }
                }}
                placeholder={placeholder}
                keyboardType={keyboardType}
                multiline={multiline}
                editable={!loading}
            />
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
    );

    const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Update Profile</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <AntDesign name="close" size={24} color="black"/>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                        {/* Avatar Section */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarWrapper}>
                                {localImage || profile.avatar_url ? (
                                    <Image
                                        source={{
                                            uri: localImage || profile.avatar_url
                                        }}
                                        style={styles.avatarImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <FontAwesome6 name="person" size={50} color="black"/> </View>
                                )}

                                {uploading && (
                                    <View style={styles.uploadingOverlay}>
                                        <ActivityIndicator size="large" color="#fff"/>
                                        <Text style={styles.uploadingText}>Uploading...</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.avatarLabel}>Profile Picture</Text>

                            <View style={styles.avatarButtons}> <TouchableOpacity
                                style={[styles.avatarButton, styles.cameraButton]}
                                onPress={takePhoto}
                                disabled={loading || uploading}
                            >
                                <AntDesign name="camera" size={20} color="white"/> <Text
                                style={styles.avatarButtonText}>Camera</Text>
                            </TouchableOpacity><TouchableOpacity
                                    style={[styles.avatarButton,styles.galleryButton]}
                                    onPress={pickImage}
                                    disabled={loading || uploading}
                                >
                                    <FontAwesome name="photo" size={20} color="#fff"/> <Text
                                    style={styles.avatarButtonText}>Gallery</Text>
                                </TouchableOpacity>
                                {(localImage || profile.avatar_url) && (
                                    <TouchableOpacity style={[styles.avatarButton, styles.removeButton]}
                                                      onPress={removeAvatar} disabled={loading || uploading}
                                    >
                                        <AntDesign name="delete" size={24} color="#fff"/>
                                        <Text style={styles.avatarButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        {renderInput('Username', 'username', 'Enter username')}
                        {renderInput('Full Name', 'fullname', 'Enter full name')}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.genderContainer}>
                                {genderOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.genderOption,
                                            profile.gender === option && styles.genderOptionSelected,
                                        ]}
                                        onPress={() => setProfile({...profile, gender: option})}
                                        disabled={loading}
                                    >
                                        <Text
                                            style={[
                                                styles.genderOptionText,
                                                profile.gender === option && styles.genderOptionTextSelected,
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputContainer, {flex: 1}]}>
                                {renderInput('Weight (kg)', 'weight', 'Enter weight', 'numeric')}
                            </View>
                            <View style={[styles.inputContainer, {flex: 1}]}>
                                {renderInput('Height (cm)', 'height', 'Enter height', 'numeric')}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.updateButton, (loading || uploading) && styles.buttonDisabled]}
                            onPress={handleUpdateProfile}
                            disabled={loading || uploading}
                        >
                            {(loading || uploading) ? (
                                <ActivityIndicator color="#fff" size="small"/>
                            ) : (<><AntDesign name="save" size={24} color="#fff"/><Text style={styles.updateButtonText}>Save
                                    Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollView: {
        maxHeight: '75%',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    updateButton: {
        backgroundColor: '#007AFF',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    saveIcon: {
        marginRight: 4,
    },
    avatarContainer: {
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingText: {
        color: '#fff',
        marginTop: 8,
        fontSize: 12,
    },
    avatarLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    avatarButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    avatarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
        minWidth: 100,
        justifyContent: 'center',
    },
    cameraButton: {
        backgroundColor: '#4CAF50',
    },
    galleryButton: {
        backgroundColor: '#2196F3',
    },
    removeButton: {
        backgroundColor: '#FF3B30',
    },
    avatarButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: '#ff3b30',
        backgroundColor: '#FFF5F5',
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 12,
        marginTop: 4,
    },
    genderContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    genderOption: {
        flex: 1,
        minWidth: 80,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    genderOptionSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    genderOptionText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    genderOptionTextSelected: {
        color: '#fff',
    },
});

export default UpdateProfileModal;