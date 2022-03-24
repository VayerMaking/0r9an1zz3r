import { View, Text, Image, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { axiosInstance } from "../utils/auth";
import { urls } from "../utils/auth";

export default function ImageComponent(props) {
    let [image, setImage] = useState<IImage>();

    const navigation = useNavigation();

    interface IImage {
        id: string,
        filename: string,
        tag: string,
        is_classified: boolean,
        colors: Array<string>
    }


    useEffect(() => {
        setImage(props.image);
        console.log("kwyid: ", props.keyId);

    }, []);
    console.log("kwyid: ", props.keyId);
    console.log("image from component: ", image);

    const URL = urls.baseApiURL + '/image/' + image.filename;


    return <>
        <TouchableOpacity
            style={styles.item}
            key={image.id}
            onPress={() => navigation.navigate('Image', { imageId: image.id, filename: image.filename, baseApiURL: urls.baseApiURL })}>
            <Image source={{ uri: URL }} style={styles.imageStyles} />

            <Text>{image.tag}</Text>
        </TouchableOpacity>
    </>

}

const styles = StyleSheet.create({
    imageStyles: {
        width: 200,
        height: 200,
    },
    highlight: {
        fontWeight: '700',
    },
    container: {
        flex: 1,
        marginTop: 8,
        backgroundColor: "aliceblue",
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start' // if you want to fill rows left to right
    },
    item: {
        width: '50%' // is 50% of container width
    },
    imageText: {
        color: "white",
    },
});