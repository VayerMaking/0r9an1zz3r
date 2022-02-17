import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, Alert, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackScreenProps } from '../types';
import { getAccessToken } from 'react-native-axios-jwt';
import { urls } from '../utils/auth';

export default function UploadScreen({ navigation }: RootStackScreenProps<'Upload'>) {

    const [image, setImage] = useState(null);
    const [imageType, setImageType] = useState(null);

    async function uploadImage() {
        if (image != null) {
            const data = new FormData();
            // data.append('image', image);
            data.append('image', {
                uri: image.uri,
                name: 'upload.jpg',
                type: imageType
            });
            await fetch(
                urls.baseApiURL + '/upload',
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
            allowsEditing: false,
            //aspect: [4, 3],
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