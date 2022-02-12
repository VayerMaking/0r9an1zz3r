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
import { useEffect, useState } from "react";
import { axiosInstance } from "../utils/auth";
import { baseApiURL } from "@env";

export default function ImageScreen({ navigation }: RootStackScreenProps<'Image'>) {
    const route = useRoute();

    const baseApiURL = route.params?.baseApiURL;
    const filename = route.params?.filename;
    const imageId = route.params?.imageId;
    const URL = baseApiURL + '/image/' + filename;

    interface IImageDetails {
        colors: string[],
        filename: string,
        id: number,
        tag: string,
    }

    let defaultImageDetails: IImageDetails = {
        colors: [],
        filename: '',
        id: 0,
        tag: ''
    };

    const [imageDetails, setImageDetails] = useState<IImageDetails>(defaultImageDetails);

    async function fetchImageDetails() {
        try {
            const url = baseApiURL + '/getImageDetails/' + imageId;
            const response = await axiosInstance.get(url);
            const json = await response.data;
            const fetchedImageDetails: IImageDetails = {
                colors: json.colors,
                filename: json.filename,
                id: json.id,
                tag: json.tag,
            }
            setImageDetails(fetchedImageDetails);
        } catch (err) {
            console.warn(err)

        }
    }

    useEffect(() => {
        fetchImageDetails();
    }, []);

    return (
        <ScrollView>
            <View style={styles.container}>
                <Image source={{ uri: URL }} style={styles.imageStyles} />
                <View style={styles.separatorLine} />
                <Text style={styles.detailItem}>TAG:</Text>
                <Text style={styles.detailItem}>{imageDetails.tag}</Text>
                <Text style={styles.detailItem}>COLORS:</Text>

                {imageDetails.colors.map(color => {
                    const keyId = imageDetails.colors.indexOf(color);
                    return (
                        <Text key={keyId} style={styles.detailItem}>{color}</Text>
                    );
                })}

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
        margin: 5,
    },
    separatorLine: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        alignSelf: 'stretch',
    }
});