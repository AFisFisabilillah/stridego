import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
} from 'react-native';
import {Colors} from "@/constants/theme";

type InputProps = {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    style?:any
};

const PRIMARY = Colors.light.primary;

const Input: React.FC<InputProps> = ({
                                         label,
                                         value,
                                         onChangeText,
                                         placeholder,
                                         secureTextEntry = false,
                                         style
                                     }) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.container]}>
            {label && (
                <Text style={styles.label}>
                    {label}
                </Text>
            )}

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                secureTextEntry={secureTextEntry}
                style={[
                    styles.input,
                    focused && styles.inputFocused,
                    style
                ]}
                
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
        </View>
    );
};

export default Input;

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width:"100%"
    },
    label: {
        marginBottom: 6,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        height: 48,
        borderWidth: 1.5,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        backgroundColor: '#fefefe',
    },
    inputFocused: {
        borderColor: PRIMARY,
    },
});
