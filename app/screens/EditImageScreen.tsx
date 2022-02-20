import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react"
import { Modal, View, TouchableOpacity, Text, StyleSheet, TextInput } from "react-native"
import { RootStackScreenProps } from "../types"
import { axiosInstance, urls } from "../utils/auth";

export default function EditImageScreen({
    navigation,
}: RootStackScreenProps<"EditImage">) {
    const route = useRoute();
    const tag = route.params?.tag;
    const imageId = route.params?.imageId;
    const [text, onChangeText] = React.useState<string>(tag);

    async function editTag() {
        const url = urls.baseApiURL + '/editTag';
        const response = await axiosInstance.put(url, { image_id: imageId, new_tag: text });
        await onChangeText(text);
        navigation.goBack();
    }

    async function deleteImage() {
        const url = urls.baseApiURL + '/deleteImage';
        const response = await axiosInstance.post(url, { image_id: imageId });
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                value={text}
            />
            <TouchableOpacity
                style={styles.editBtn}
                onPress={() => editTag()
                }>
                <Text style={styles.btnText}>edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteImage()
                }>
                <Text style={styles.btnText}>delete</Text>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBtn: {
        width: "40%",
        backgroundColor: "blue",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 10
    },
    deleteBtn: {
        width: "40%",
        backgroundColor: "red",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 10
    },
    btnText: {
        color: "white"
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
})