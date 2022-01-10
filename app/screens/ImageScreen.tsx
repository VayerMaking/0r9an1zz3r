import * as React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import ImageComponent from '../components/ImageComponent';
import { Text, View } from '../components/Themed';
import { RootStackParamList, RootStackScreenProps, RootTabScreenProps } from '../types';

export default function ImageScreen({ navigation }: RootStackScreenProps<'Image'>) {
    return (
        <Text>image screen</Text>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});