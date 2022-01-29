import { View, Text, Image, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import useAxios from "../hooks/useAxios";

const wait = (timeout: number | undefined) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function ImageComponent() {
    let [images, setImages] = useState([]);
    const baseURL = 'http://192.168.88.244:80';
    // const baseURL = 'http://18.191.82.215:80';
    const [refreshing, setRefreshing] = React.useState(false);
    const navigation = useNavigation();
    // let isInitialFetch: boolean = true;
    const axiosInstance = useAxios();

    interface IImage {
        id: string,
        filename: string,
        tag: string,
        is_classified: boolean,
        colors: Array<string>
    }
    async function fetchImages() {
        const url = baseURL + '/getImages';
        const response = await axiosInstance.get(url);
        const json = await response.data.data();
        console.log("images: ", images);

        if (images.length === 0) {
            setImages(images = json);
            console.log("setting intial images");
            return;
        }
        //  const absent = images.filter(image => !json.includes(image));
        const absent = json.filter(image => !images.includes(image));
        console.log("absent: ", absent.length);
        //console.log("images bf: ", images.slice(-1)[0]);
        // if (isInitialFetch) {
        //     setImages(json);
        //     console.log('setting images')
        //     isInitialFetch = false;
        // } else {
        const newImages: any = [...absent, ...images].reverse();
        setImages(newImages);
        // }

        //console.log("images after: ", images.slice(-1)[0]);
        console.log("images: ", images.length);
        return;
    }
    //const newImages = useMemo(() => fetchImages(), []);
    // kolcho --> useMemo or useCalback


    useEffect(() => {
        fetchImages();
        // console.log(images.length);
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchImages();
        wait(2000).then(() => setRefreshing(false));
    }, []);

    return <>
        <ScrollView refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        }>
            <View style={styles.container}>
                {images ? (
                    images.map(i => {
                        //@ts-ignore
                        const URL = baseURL + '/image/' + i.filename;
                        const keyId = images.indexOf(i);
                        return (
                            <TouchableOpacity
                                style={styles.item}
                                key={keyId}
                                onPress={() => navigation.navigate('Image', { filename: i.filename, baseURL: baseURL })}>
                                <Image source={{ uri: URL }} style={styles.imageStyles} />

                                <Text>{i.tag}</Text>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <Text style={styles.highlight}>No images found</Text>
                )}
            </View>
        </ScrollView>
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