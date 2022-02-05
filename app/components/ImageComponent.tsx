import { View, Text, Image, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useMemo } from 'react';
import { withSafeAreaInsets } from "react-native-safe-area-context";
import { Props } from "../types";
import { useNavigation } from '@react-navigation/native';
import { axiosInstance } from "../utils/auth";
// import useAxios from "../hooks/useAxios";


const wait = (timeout: number | undefined) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
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

export default function ImageComponent() {
    const [images, setImages] = useState([]);
    const baseURL = 'http://192.168.88.244:80';
    const [refreshing, setRefreshing] = React.useState(false);
    const navigation = useNavigation();

    interface IImage {
        id: string,
        filename: string,
        tag: string,
        is_classified: boolean,
        colors: Array<string>
    }
    async function fetchImages() {
        const url = baseURL + '/getImages';
        try {
            const response = await axiosInstance.get(url);
            console.log(JSON.stringify(response));
            const json = await response.data;
            console.log("images: ", images);
            console.log("json: ", json);


            if (images.length === 0) {
                setImages(images = json);
                console.log("setting intial images");
                return;
            }
            //  const absent = images.filter(image => !json.includes(image));
            const absent = json.filter(({ id }) => !images.find(image => image.id == id));
            console.log("absent: ", absent.length);
            //console.log("images bf: ", images.slice(-1)[0]);
            // if (isInitialFetch) {
            //     setImages(json);
            //     console.log('setting images')
            //     isInitialFetch = false;
            // } else {
            const newImages: any = [...absent, ...images];
            setImages(newImages);
            // }

            //console.log("images after: ", images.slice(-1)[0]);
            console.log("images: ", images.length);
            return;
        } catch (err) {
            console.warn(err)

        }

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

                                <Text>{
                                    //@ts-ignore
                                    i.tag
                                }</Text>
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

