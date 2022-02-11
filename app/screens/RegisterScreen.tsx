import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { RootStackScreenProps } from '../types';
import { axiosInstance, ILoginRequest, IRegisterRequest } from '../utils/auth';
import { getAccessToken, getRefreshToken, setAuthTokens } from 'react-native-axios-jwt';


export default function RegisterScreen({ navigation }: RootStackScreenProps<'Register'>) {
    let [email, setEmail] = useState<string>('');
    let [password, setPassword] = useState<string>('');
    let [username, setUsername] = useState<string>('');

    const register = async (params: IRegisterRequest) => {
        const response = await axiosInstance.post('/register', params)

        await setAuthTokens({
            accessToken: response.data.data.access,
            refreshToken: response.data.data.refresh
        })

        navigation.push('Root', { screen: 'TabThree' });
    }
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>0r9an1zz3r</Text>
            <View style={styles.inputView} >
                <TextInput
                    style={styles.inputText}
                    placeholder="Username..."
                    placeholderTextColor="#003f5c"
                    autoCapitalize='none'
                    onChangeText={text => setUsername(text)} />
            </View>
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

            <TouchableOpacity onPress={() => register({ username, email, password })}>
                <Text style={styles.loginText}>Register</Text>
            </TouchableOpacity>


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
        marginTop: 40,
        marginBottom: 10
    },
    loginText: {
        color: "white"
    }
});