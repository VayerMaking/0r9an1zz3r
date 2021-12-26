import { View, Text, Image, StyleSheet, ScrollView, RefreshControl } from "react-native";
import React, { useState, useEffect } from 'react';


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
});

export default function ImageComponent() {
    const [images, setImages] = useState([]);
    const baseURL = 'http://192.168.88.244:80';
    const [refreshing, setRefreshing] = React.useState(false);

    interface IImage {
        id: string,
        filename: string,
        tag: string,
        is_classified: boolean,
        colors: Array<string>
    }
    async function fetchImages() {
        const url = baseURL + '/getImages';
        const response = await fetch(url);
        const json = await response.json();
        setImages(json);
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
                        const URL = baseURL + '/image/' + i.filename;
                        const keyId = images.indexOf(i);
                        return (
                            <View style={styles.item} key={keyId}>
                                <Image source={{ uri: URL }} style={styles.imageStyles} />
                            </View>
                        );
                    })
                ) : (
                    <Text style={styles.highlight}>No images found</Text>
                )}
            </View>
        </ScrollView>
    </>

}



// export default class ImageComponent extends React.Component { 
//     render() { 
//       return (
//         <ImageComponent/>
//       );
//     }
//   }

