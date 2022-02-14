import { View, Text, Image, StyleSheet, ScrollView, RefreshControl } from "react-native";
import React, { useState, useEffect } from 'react';
import { withSafeAreaInsets } from "react-native-safe-area-context";
import { urls } from "../utils/auth";

const wait = (timeout: number | undefined) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function ImageComponent() {
    const [categories, setCategories] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);

    async function fetchCategories() {
        const url = urls.baseApiURL + '/getCategories';
        const response = await fetch(url);
        const json = await response.json();
        setCategories(json);
    }
    useEffect(() => {
        fetchCategories();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchCategories();
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
                {categories ? (
                    categories.map(category => {
                        const keyId = categories.indexOf(category);
                        return (
                            <View key={keyId} style={styles.category}>
                                <Text>{category}</Text>
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
    category: {
        margin: 10,
    }
});
