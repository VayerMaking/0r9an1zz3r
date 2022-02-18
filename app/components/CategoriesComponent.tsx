import { View, Text, Image, StyleSheet, ScrollView, RefreshControl, Dimensions } from "react-native";
import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from "react-native-dynamic-search-bar";
import { axiosInstance, urls } from "../utils/auth";
import DropdownComponent from "./DropdownComponent";

const wait = (timeout: number | undefined) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function ImageComponent() {
    const [tags, setTags] = useState([]);
    const [filteredTags, setFilteredTags] = useState([...tags]);
    const [refreshing, setRefreshing] = React.useState(false);

    const [text, setText] = useState('');

    const onChangeText = useCallback((value) => {
        setText(value);
    }, []);

    function searchData(searchValue: any) {
        if (searchValue == undefined) {
            return setFilteredTags(tags);
        }
        const filteredData = tags.filter((item: string) => {

            return item.toLowerCase().includes(searchValue.toLowerCase());
        });
        setFilteredTags(filteredData);
        return filteredData;
    }


    async function fetchTags() {
        const url = urls.baseApiURL + '/getCategories';
        const response = await axiosInstance.get(url);
        const json = await response.data;
        setTags(json);
    }
    useEffect(() => {
        fetchTags();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchTags();
        wait(2000).then(() => setRefreshing(false));
    }, []);


    return <>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <View>
                <SearchBar
                    placeholder="Search"
                    onPress={() => alert("onPress")}
                    onChangeText={(text) => searchData(text)}
                    onClearPress={(text) => searchData(text)}
                    onSearchPress={() => console.log("Search Icon is pressed")}
                    style={{
                        width: Dimensions.get("screen").width * .60
                    }}
                />
            </View >

            <View style={{ width: Dimensions.get("screen").width * .40 }}>
                <DropdownComponent></DropdownComponent>
            </View>

        </View>


        <ScrollView refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        }>
            <View style={styles.container}>
                {filteredTags ? (
                    filteredTags.map(tag => {
                        const keyId = tags.indexOf(tag);
                        return (
                            <View key={keyId} style={styles.tag}>
                                <Text>{tag}</Text>
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

const styles = StyleSheet.create({
    highlight: {
        fontWeight: '700',
    },
    container: {
        flex: 1,
        marginTop: 8,
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'flex-start',   // if you want to fill rows left to right
        justifyContent: "space-between"

    },
    tag: {
        margin: 10,
    }
});
