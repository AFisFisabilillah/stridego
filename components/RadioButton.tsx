import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';

type Props = {
    label?: string;
    checked: boolean;
    onPress: () => void;
};

const RadioButton = ({label, checked, onPress}: Props) => {
    return (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <View style={styles.outer}>
                {checked && <View style={styles.inner}/>}
            </View>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    outer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1E90FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1E90FF',
    },
    label: {
        marginLeft: 8,
        fontSize: 14,
    },
});

export default RadioButton;
