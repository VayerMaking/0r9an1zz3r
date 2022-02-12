import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackScreenProps } from '../types';
import { baseApiURL } from '@env';
import { getAccessToken } from 'react-native-axios-jwt';

export default function UploadScreen({ navigation }: RootStackScreenProps<'Upload'>) {

    const [image, setImage] = useState(null);
    const [imageType, setImageType] = useState(null);

    async function uploadImage() {
        if (image != null) {
            // await ImagePicker.requestMediaLibraryPermissionsAsync();
            const data = new FormData();
            // data.append('image', image);
            data.append('image', {
                uri: image.uri,
                name: 'upload.jpg',
                type: imageType
            });
            await fetch(
                baseApiURL + '/upload',
                {
                    method: 'post',
                    body: data,
                    headers: {
                        'Content-Type': 'multipart/form-data; ',
                        'Authorization': `Bearer ${await getAccessToken()}`
                    },
                }
            );

        }
    }


    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
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
            <Button title="Upload Image" onPress={uploadImage} />
        </View>
    );
}