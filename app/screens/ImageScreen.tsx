import {
    useLinkProps,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import * as React from 'react';
import { StyleSheet, ScrollView, Image } from 'react-native';

import ImageComponent from '../components/ImageComponent';
import { Text, View } from '../components/Themed';
import { RootStackParamList, RootStackScreenProps, RootTabScreenProps } from '../types';
import window from '../constants/Layout';

export default function ImageScreen({ navigation }: RootStackScreenProps<'Image'>) {
    const route = useRoute();
    // const rp = Object.assign(route.params, Object);
    // console.log(Object.values(rp)[0])
    const baseURL = route.params?.baseURL;
    const filename = route.params?.filename;
    const URL = baseURL + '/image/' + filename;

    return (
        <ScrollView>
            <View style={styles.container}>
                <Image source={{ uri: URL }} style={styles.imageStyles} />
                <Text style={styles.detailItem}>image data 1</Text>
                <Text style={styles.detailItem}>image data 2</Text>
                <Text style={styles.detailItem}>image data 3</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    imageStyles: {
        // alignItems: 'center',
        height: window.window.height * 0.8,
        width: window.window.width,
        resizeMode: 'contain',
    },
    detailItem: {
        margin: 30,
    }
});