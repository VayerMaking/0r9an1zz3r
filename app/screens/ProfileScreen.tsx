import { View, Text, StyleSheet, Button } from "react-native";
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
            <View>
                <Text> not logged in</Text>
                <Button
                    title="login"
                    onPress={() => navigation.navigate('Login')}
                />
            </View>
        </>
    } else {
        return <>
            <View style={styles.container}>
                <Text>logged in</Text>
                <Text>{profile.email}</Text>
                <Text>{profile.username}</Text>
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
        marginTop: 8,
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',   // if you want to fill rows left to right
        justifyContent: "center",
    },
});