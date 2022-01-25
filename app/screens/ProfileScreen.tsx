import { View, Text, StyleSheet } from "react-native";
import React, { useState, useEffect } from 'react';

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
    const baseURL = 'http://192.168.88.244:80';
    // const baseURL = 'http://18.191.82.215:80';

    const user = "user1";
    // TODO: fetch info about which user is logged in from the app

    async function fetchProfile() {
        const url = baseURL + '/getProfile/' + user;
        const response = await fetch(url);
        const json = await response.json();
        const fetchedProfile: IProfile = {
            email: json.user_email,
            username: json.user_pass,
        }

        setProfile(fetchedProfile);
    }
    useEffect(() => {
        fetchProfile();
    }, []);

    if (profile?.email == '' || profile?.username == '') {
        return <>
            <View>
                <Text> not logged in</Text>
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
    }
});