import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Linking } from 'react-native';
import { RootStackScreenProps } from '../types';
import { useNavigation } from '@react-navigation/native';
import { axiosInstance, ILoginRequest, urls } from '../utils/auth';
import { getAccessToken, getRefreshToken, setAuthTokens } from 'react-native-axios-jwt';
import { FontAwesome, FontAwesome5, SimpleLineIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { InAppBrowser } from 'react-native-inappbrowser-reborn'

export default function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
    let [email, setEmail] = useState<string>('');
    let [password, setPassword] = useState<string>('');

    const login = async (params: ILoginRequest) => {
        const response = await axiosInstance.post('/login', params)

        await setAuthTokens({
            accessToken: response.data.data.access,
            refreshToken: response.data.data.refresh
        })

        navigation.push('Root', { screen: 'TabThree' });
    }

    const _handlePressButtonAsync = async () => {
        const redirect = await Linking.getInitialURL('/')
        console.log("redirect", redirect);
        let result = await WebBrowser.openBrowserAsync(urls.baseAuthURL + '/social/google');
        // const result = await InAppBrowser.open(urls.baseAuthURL + '/social/google');
        console.log("result", result);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>0r9an1zz3r</Text>
            <View style={styles.inputView} >
                <TextInput
                    style={styles.inputText}
                    placeholder="Email..."
                    placeholderTextColor="#003f5c"
                    autoCapitalize='none'
                    onChangeText={text => setEmail(text)} />
            </View>
            <View style={styles.inputView} >
                <TextInput
                    secureTextEntry
                    style={styles.inputText}
                    placeholder="Password..."
                    placeholderTextColor="#003f5c"
                    onChangeText={text => setPassword(text)} />
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={() => login({ email, password })}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.loginText}>LOGIN</Text>
                </View>

            </TouchableOpacity>
            <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>REGISTER</Text>
            </TouchableOpacity>

            <FontAwesome.Button
                name="google" size={24}
                width={200} color="black"
                backgroundColor="#3b5998"
                borderRadius={25}
                onPress={_handlePressButtonAsync}>
                Login with Google
            </FontAwesome.Button>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003f5c',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontWeight: "bold",
        fontSize: 50,
        color: "#fb5b5a",
        marginBottom: 40
    },
    inputView: {
        width: "80%",
        backgroundColor: "#465881",
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        justifyContent: "center",
        padding: 20
    },
    inputText: {
        height: 50,
        color: "white"
    },
    forgot: {
        color: "white",
        fontSize: 11
    },
    loginBtn: {
        width: "80%",
        backgroundColor: "#fb5b5a",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
        textAlignVertical: 'center'
    },
    registerBtn: {
        width: "54%",
        backgroundColor: "#3b5998",
        borderRadius: 25,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
        textAlignVertical: 'center'
    },
    loginText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold"
    },
    registerText: {
        color: "black",
        fontSize: 16,
        fontWeight: "bold"
    }
});