import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, Alert, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackScreenProps } from '../types';
import { getAccessToken } from 'react-native-axios-jwt';
import { axiosInstance, urls } from '../utils/auth';
import mime from "mime";


export default function UploadScreen({ navigation }: RootStackScreenProps<'Upload'>) {

    const [image, setImage] = useState(null);
    const [imageType, setImageType] = useState(null);

    async function uploadImage() {
        try {
            if (image != null) {
                const newImageUri = "file:///" + image.uri.split("file:/").join("");

                const data = new FormData();
                data.append('image', {
                    uri: newImageUri,
                    name: 'uploadpic',
                    type: mime.getType(newImageUri)
                });

                await fetch(
                    urls.baseApiURL + '/upload',
                    {
                        method: 'post',
                        body: data,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${await getAccessToken()}`
                        },
                    }
                );
            }
        } catch (e) {
            console.log(e);

        }
    }


    const pickImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            setImage(result);
            setImageType(result.type);
        }
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button title="Choose Image" onPress={pickImage} />
            {image && <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />}
            <Button title="Upload Image" onPress={async () => { await uploadImage(); navigation.goBack() }} />
        </View>
    );
}