import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { isLoggedIn, setAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken } from 'react-native-axios-jwt'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from "../utils/auth";

const wait = (timeout: number | undefined) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function ProfileScreen() {
    interface IProfile {
        email: string,
        username: string,
    }

    let defaultProfile: IProfile = {
        email: '',
        username: '',
    };

    const [profile, setProfile] = useState<IProfile>(defaultProfile);
    const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined);
    const baseURL = 'http://192.168.88.244:80';
    // const baseURL = 'http://18.191.82.215:80';

    const navigation = useNavigation();

    if (loggedIn == undefined) {
        isLoggedIn().then(setLoggedIn);
    }

    async function fetchProfile() {
        try {
            const url = baseURL + '/getUser';
            const response = await axiosInstance.get(url);
            const json = await response.data;
            const fetchedProfile: IProfile = {
                email: json.email,
                username: json.username,
            }
            setProfile(fetchedProfile);
        } catch (err) {
            console.warn(err)

        }
    }

    useEffect(() => {
        fetchProfile();
    }, []);


    if (!loggedIn) {
        return <>
            <View style={styles.container}>
                <Text style={styles.logo}>Profile</Text>
                <Text> not logged in</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </>
    } else {
        return <>
            <View style={styles.container}>
                <Text style={styles.logo}>Profile</Text>
                <Text style={styles.profileText}>logged in as :</Text>
                <Text style={styles.profileDataText}>{profile.email}</Text>
                <Text style={styles.profileDataText}>{profile.username}</Text>
                <TouchableOpacity style={styles.button} onPress={() => { clearAuthTokens(); setLoggedIn(false) }}>
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </>
    }
}

const styles = StyleSheet.create({
    highlight: {
        fontWeight: '700',
    },
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
    button: {
        width: "80%",
        backgroundColor: "#fb5b5a",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 10
    },
    buttonText: {
        color: "white",
        fontSize: 20,
    },
    profileDataText: {
        color: "white",
        fontSize: 15,
    },
    profileText: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    }
});