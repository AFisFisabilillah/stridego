// PhotoProfileSimple.tsx
import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    ImageSourcePropType,
    ImageURISource,
    Platform,
} from 'react-native';

interface PhotoProfileSimpleProps {
    size: number;
    imageUri: string | ImageURISource;
    glowColor?: string;
    glowSize?: number;
    onError?: () => void;
}

const PhotoProfileSimple: React.FC<PhotoProfileSimpleProps> = ({
                                                                   size,
                                                                   imageUri,
                                                                   glowColor = '#2196F3',
                                                                   glowSize,
                                                                   onError,
                                                               }) => {
    const glowSpread = glowSize || Math.max(6, size * 0.5);
    const containerSize = size + (glowSpread * 2);

    const imageSource = typeof imageUri === 'string'
        ? { uri: imageUri }
        : imageUri;

    return (
        <View style={[styles.container, { width: containerSize, height: containerSize }]}>
            {/* Main glow shadow */}
            <View style={[
                styles.glow,
                {
                    width: size + glowSpread,
                    height: size + glowSpread,
                    borderRadius: (size + glowSpread) / 2,
                    shadowColor: glowColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: .4,
                    shadowRadius: glowSpread * 0.8,
                    elevation: glowSpread,
                }
            ]} />

            {/* Profile image with white border */}
            <View style={[
                styles.imageWrapper,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: Math.max(2, size * 0.03),
                    borderColor: '#FFFFFF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }
            ]}>
                <Image
                    source={imageSource}
                    style={[
                        styles.image,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                        }
                    ]}
                    resizeMode="cover"
                    onError={onError}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    glow: {
        position: 'absolute',
        backgroundColor: 'transparent',
    },
    imageWrapper: {
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    image: {
        backgroundColor: '#f0f0f0',
    },
});

export default PhotoProfileSimple;