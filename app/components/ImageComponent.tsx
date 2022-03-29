import { View, Text, Image, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { axiosInstance } from "../utils/auth";
import { urls } from "../utils/auth";

const wait = (timeout: number | undefined) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function ImageComponent() {
    let [images, setImages] = useState([]);
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
        const url = urls.baseApiURL + '/getImages';
        try {
            const response = await axiosInstance.get(url);
            const json = await response.data;

            if (images.length === 0) {
                setImages(images = json);
                return;
            }
            const absent = json.filter(({ id }) => !images.find(image => image.id == id));

            const newImages: any = [...absent, ...images];
            setImages(newImages);

            return;
        } catch (err) {
            console.warn(err)

        }

    }


    useEffect(() => {
        fetchImages();
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
                        const URL = urls.baseApiURL + '/image/' + i.filename;
                        const keyId = images.indexOf(i);
                        return (
                            <TouchableOpacity
                                style={styles.item}
                                key={keyId}
                                onPress={() => navigation.navigate('Image', { imageId: i.id, filename: i.filename, baseApiURL: urls.baseApiURL })}>
                                <Image source={{ uri: URL }} style={styles.imageStyles} />
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