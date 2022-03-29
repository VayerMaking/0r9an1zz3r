import {
    useLinkProps,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import * as React from 'react';
import { StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Pressable, RefreshControl } from 'react-native';

import ImageComponent from '../components/ImageComponent';
import { Text, View } from '../components/Themed';
import { RootStackParamList, RootStackScreenProps, RootTabScreenProps } from '../types';
import window from '../constants/Layout';
import { useEffect, useState } from "react";
import { axiosInstance, urls } from "../utils/auth";
import { PieChart } from "react-native-chart-kit";
import { FontAwesome } from "@expo/vector-icons";

const wait = (timeout: number | undefined) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function ImageScreen({
    navigation,
}: RootStackScreenProps<"Image">) {
    const route = useRoute();

    const baseApiURL = route.params?.baseApiURL;
    const filename = route.params?.filename;
    const imageId = route.params?.imageId;
    const URL = baseApiURL + "/image/" + filename;

    const [dataState, setDataState] = useState<{
        name: string,
        color: string,
        population: number,
        legendFontColor: string,
        legendFontSize: number
    }[]>([]);
    const [refreshing, setRefreshing] = React.useState(false);


    interface IImageDetails {
        colors_rgb: string[];
        colors_hex: string[];
        color_percentages: number[];
        filename: string;
        id: number;
        tags: string[];
        image_text: string;
    }

    let defaultImageDetails: IImageDetails = {
        colors_rgb: [],
        colors_hex: [],
        color_percentages: [],
        filename: "",
        id: 0,
        tags: [],
        image_text: "",
    };

    const [imageDetails, setImageDetails] =
        useState<IImageDetails>(defaultImageDetails);

    navigation.setOptions({
        headerRight: () =>
            <Pressable
                onPress={() => navigation.navigate('EditImage', { imageId: imageId, tags: imageDetails.tags })}

                style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                })}>
                <FontAwesome
                    name="info-circle"
                    size={25}
                    color="black"
                    style={{ marginRight: 15 }}
                />
            </Pressable>
        ,
    });

    function setData(imgDetails: IImageDetails) {
        let temp = [...dataState];
        let sum = imgDetails.color_percentages.reduce(function (a, b) {
            return a + b;
        }, 0);
        for (let i = 0; i < 3; i++) {
            temp.push({
                name: imgDetails.colors_rgb[i],
                color: imgDetails.colors_hex[i],
                population: 100 * imgDetails.color_percentages[i] / sum,
                legendFontColor: "#7F7F7F",
                legendFontSize: 15
            });
        }
        return setDataState(temp);
    }

    async function fetchImageDetails() {
        try {
            const url = baseApiURL + "/getImageDetails/" + imageId;
            const response = await axiosInstance.get(url);
            const json = await response.data;
            const fetchedImageDetails: IImageDetails = {
                colors_rgb: json.colors_rgb,
                colors_hex: json.colors_hex,
                filename: json.filename,
                id: json.id,
                tags: json.tags,
                color_percentages: json.color_percentages,
                image_text: json.image_text,
            };
            setData(fetchedImageDetails);

            setImageDetails(fetchedImageDetails);
            console.log(imageDetails);
        } catch (err) {
            console.warn(err);
        }
    }
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchImageDetails();
        wait(2000).then(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        fetchImageDetails();
    }, []);

    const chartConfig = {
        backgroundColor: "#e26a00",
        backgroundGradientFrom: "#fb8c00",
        backgroundGradientTo: "#ffa726",
        decimalPlaces: 2, // optional, defaults to 2dp
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
        },
    };

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }>
            <View style={styles.container}>
                <Image source={{ uri: URL }} style={styles.imageStyles} />
                <View style={styles.separatorLine} />
                <Text style={styles.detailItem}>TAGS:</Text>
                <View style={styles.roundContainer}>
                    {imageDetails.tags.map((tag) => {
                        const keyId = imageDetails.tags.indexOf(tag);
                        return (
                            <Text key={keyId} style={styles.detailItem}>
                                {tag}
                            </Text>
                        );
                    })}
                </View>
                <Text style={styles.detailItem}>COLORS:</Text>

                <View style={styles.roundContainer}>
                    {imageDetails.colors_hex.map((color) => {
                        const keyId = imageDetails.colors_hex.indexOf(color);
                        return (
                            <Text key={keyId} style={styles.detailItem}>
                                {color}
                            </Text>
                        );
                    })}
                </View>

                {dataState && (
                    <PieChart
                        data={dataState}
                        width={Dimensions.get("screen").width}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                    />
                )}

                <View style={styles.imageTextContainer}>
                    <ScrollView>
                        <Text style={{ margin: 15 }}>
                            {imageDetails.image_text}
                        </Text>
                    </ScrollView>
                </View>
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
        borderBottomColor: 'grey',
        borderBottomWidth: 1,
        alignSelf: 'stretch',
    },
    roundContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderColor: 'grey',
        borderRadius: 5,
        borderWidth: 1
    },
    imageTextContainer: {
        height: 100,
        borderColor: "grey",
        borderRadius: 5,
        borderWidth: 1,
        margin: 20
    }
});