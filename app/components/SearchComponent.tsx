import { View, Text, Image, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from "react-native-dynamic-search-bar";
import { axiosInstance, urls } from "../utils/auth";
import { Dropdown } from 'react-native-element-dropdown';
import SearchImagesComponent from "./ResultImagesComponent";
// import { ColorPicker } from "react-native-btr";
import { ColorPicker } from "./ColorPickerComponent";
import { useNavigation } from "@react-navigation/native";

const data = [
    { label: 'Tags', value: 'by_tag' },
    { label: 'Color Name', value: 'by_color_name' },
    { label: 'Color Hex', value: 'by_color_hex' },
    { label: 'Color Picker', value: 'color_picker' },
    { label: 'Text', value: 'by_text' }

];

const wait = (timeout: number | undefined) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function ImageComponent() {
    const [tags, setTags] = useState([]);
    const [tagsVisability, setTagsVisability] = useState<boolean>(false);
    const [images, setImages] = useState([]);
    const [imagesVisability, setImagesVisability] = useState<boolean>(false);
    const [colorNames, setColorNames] = useState([]);
    const [colors, setColors] = useState([]);

    // const [filteredTags, setFilteredTags] = useState([...tags]);
    const [filteredData, setFilteredData] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [dropdownValue, setDropdownValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);

    const [colorPickerVisability, setColorPickerVisability] = useState<boolean>(false);
    const [text, setText] = useState('');

    // const onChangeText = useCallback((value) => {
    //     setText(value);
    //     searchDataOnChange(text, dropdownValue);  
    // }, []);

    function onChangeText(text: React.SetStateAction<string>, dropdownValue: string | null) {
        setTagsVisability(true);
        setText(text);
        searchDataOnChange(text, dropdownValue);

    }

    const [selectedColor, setSelectedColor] = useState("");

    const navigation = useNavigation();

    function setColor(color: string) {
        setSelectedColor(color);
        setText(color);
    }

    async function searchDataOnChange(searchValue: any, searchType: string | null) {
        if (searchType == 'by_tag') {
            console.log("by tag");
            console.log(searchValue);
            //console.log("tags: ", await fetchTags())

            if (searchValue == undefined) {
                return setFilteredData(tags);
            }
            const filteredData = tags.filter((item: string) => {
                return item.toLowerCase().includes(searchValue.toLowerCase());
            });
            setFilteredData(filteredData);

            return filteredData;

        } else if (searchType == 'by_color_name') {
            console.log("by clor name");
            console.log(searchValue);
            if (searchValue == undefined) {
                return setFilteredData(colorNames);
            }
            const filteredData = colorNames.filter((item: string) => {

                return item.toLowerCase().includes(searchValue.toLowerCase());
            });
            setFilteredData(filteredData);

            return filteredData;

        } else if (searchType == 'by_color_hex') {
            console.log("by hex");
            console.log(searchValue);
            console.log("colors: ", colors);


            if (searchValue == undefined) {
                return setFilteredData(colors);
            }
            const filteredData = colors.filter((item: string) => {

                return item.toLowerCase().includes(searchValue.toLowerCase());
            });
            console.log("colors filtered: ", filteredData);

            setFilteredData(filteredData);

            return filteredData;

        }
    }

    async function searchDataOnPress(searchValue: any, searchType: string | null) {
        setImagesVisability(true);

        if (searchType == 'by_tag') {
            return getByTag(searchValue);
        } else if (searchType == 'by_color_name') {
            return getByColorName(searchValue);
        } else if (searchType == 'by_color_hex') {
            // setImagesVisability(true);
            return getByHex(searchValue);
        } else if (searchType == 'color_picker') {
            // setImagesVisability(true);
            return getByHex(searchValue);
        } else if (searchType == 'by_text') {
            return getByText(searchValue);
        }

    }

    async function getByHex(searchValue: string) {
        const url = urls.baseApiURL + '/getByHex';
        console.log(searchValue);
        const response = await axiosInstance.get(url, { params: { hex_val: searchValue } });
        const json = await response.data;
        setColorPickerVisability(false)
        setImages(json);

    }

    async function getByColorName(searchValue: string) {
        const url = urls.baseApiURL + '/getByColorName';
        console.log(searchValue);
        const response = await axiosInstance.get(url, { params: { color_name: searchValue.toLowerCase() } });
        const json = await response.data;
        setColorPickerVisability(false)
        setImages(json);
    }

    async function getByTag(searchValue: string) {
        const url = urls.baseApiURL + '/getByTag';
        const response = await axiosInstance.get(url, { params: { tag: searchValue } });
        const json = await response.data;
        setColorPickerVisability(false)
        setImages(json);
    }

    async function getByText(searchValue: string) {
        const url = urls.baseApiURL + '/getByImageText';
        const response = await axiosInstance.get(url, { params: { text: searchValue } });
        const json = await response.data;
        setColorPickerVisability(false)
        setImages(json);
    }

    async function fetchTags() {
        const url = urls.baseApiURL + '/getTags';
        const response = await axiosInstance.get(url);
        const json = await response.data;
        setTags(json);
    }

    async function fetchColorNames() {
        const url = urls.baseApiURL + '/getColorNames';
        const response = await axiosInstance.get(url);
        const json = await response.data;
        setColorNames(json);
    }

    async function fetchColors() {
        const url = urls.baseApiURL + '/getHexValues';
        const response = await axiosInstance.get(url);
        const json = await response.data;
        setColors(json);
    }

    useEffect(() => {
        fetchTags();
        fetchColors();
        fetchColorNames();
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
                    //onPress={() => alert("onPress")}
                    onChangeText={(text) => onChangeText(text, dropdownValue)}
                    onClearPress={() => { setText(''); setImagesVisability(false) }}
                    onSearchPress={() => searchDataOnPress(text, dropdownValue)}
                    style={{
                        width: Dimensions.get("screen").width * .60
                    }}
                />
            </View >

            <View style={{ width: Dimensions.get("screen").width * .40 }}>
                <Dropdown
                    style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    iconStyle={styles.iconStyle}
                    data={data}
                    maxHeight={140}
                    labelField="label"
                    valueField="value"
                    value={dropdownValue}
                    onFocus={() => { setIsFocus(true), setImagesVisability(false) }}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                        setDropdownValue(item.value);
                        if (item.value == 'color_picker') {
                            setColorPickerVisability(true);
                            setTagsVisability(false);
                        } else if (item.value == 'by_tag') {
                            setTagsVisability(true);
                        } else {
                            setColorPickerVisability(false);
                            setTagsVisability(true);
                        }
                        setIsFocus(false);
                    }}
                />
            </View>

        </View>
        {/* // <View>
            //     <SearchImagesComponent images={images}></SearchImagesComponent>
            // </View> */}
        {imagesVisability &&
            <ScrollView>
                <View style={styles.imagesContainer}>
                    {images ? (
                        images.map(i => {
                            //@ts-ignore
                            const URL = urls.baseApiURL + '/image/' + i.filename;
                            const keyId = images.indexOf(i);
                            return (
                                // <SearchImagesComponent keyId={images.indexOf(i)} image={i}></SearchImagesComponent>
                                <TouchableOpacity
                                    style={styles.item}
                                    key={keyId}
                                    onPress={() => navigation.navigate('Image', { imageId: i.id, filename: i.filename, baseApiURL: urls.baseApiURL })}>
                                    <Image source={{ uri: URL }} style={styles.imageStyles} />

                                    {/* <Text>{i.tag}</Text> */}
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <Text style={styles.highlight}>No images found</Text>
                    )}
                </View>
            </ScrollView>
        }


        {colorPickerVisability &&
            <View style={styles.colorPickerContainer}>
                {/* <Text>Selected Color = {selectedColor}</Text> */}
                <View style={styles.wrapper}>
                    <ColorPicker selectedColor={selectedColor} onSelect={setColor} colors={colors} />
                </View>
                {/* <Text> Scroll Horizontally for more colors </Text> */}
            </View>
        }


        {tagsVisability &&
            <ScrollView>
                <View style={styles.container}>
                    {filteredData ? (
                        filteredData.map(item => {
                            const keyId = filteredData.indexOf(item);
                            return (
                                <TouchableOpacity
                                    key={keyId}
                                    style={styles.tag}
                                    onPress={() => { searchDataOnPress(item, dropdownValue); setTagsVisability(false) }}
                                >
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <Text style={styles.highlight}>No tags found</Text>
                    )}
                </View>
            </ScrollView>
        }

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
    },
    dropdown: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    colorPickerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",

    },
    wrapper: {
        backgroundColor: "#fff",
        marginVertical: 10,
    },
    imageStyles: {
        width: 200,
        height: 200,
    },
    imagesContainer: {
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
