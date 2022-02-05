import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { RootStackScreenProps } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../components/User/UserContext';
import { axiosInstance, ILoginRequest } from '../utils/auth';
import { getAccessToken, getRefreshToken, setAuthTokens } from 'react-native-axios-jwt';


export default function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
    let [email, setEmail] = useState<string>('');
    let [password, setPassword] = useState<string>('');

    const baseURL = 'http://192.168.88.244:5000';

    const login = async (params: ILoginRequest) => {
        const response = await axiosInstance.post('/login', params)

        // save tokens to storage
        await setAuthTokens({
            accessToken: response.data.data.access,
            refreshToken: response.data.data.refresh
        })

        navigation.push('Root', { screen: 'TabThree' });
    }
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>HeyAPP</Text>
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
            <TouchableOpacity>
                <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginBtn} onPress={() => login({ email, password })}>
                <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text style={styles.loginText}>Signup</Text>
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