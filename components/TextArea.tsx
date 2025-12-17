import React, {useState} from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';

type TextAreaProps = {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
};

const PRIMARY = '#1E90FF';

const TextArea: React.FC<TextAreaProps> = ({
                                               label,
                                               value,
                                               onChangeText,
                                               placeholder,
                                           }) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={[
                    styles.textarea,
                    focused && styles.focused,
                ]}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
        </View>
    );
};

export default TextArea;

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    textarea: {
        minHeight: 120,
        borderWidth: 1.5,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        backgroundColor: '#fff',
    },
    focused: {
        borderColor: PRIMARY,
    },
});
