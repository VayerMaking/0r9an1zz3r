import axios from "axios";
import jwt_decode from "jwt-decode";
import dayjs from 'dayjs';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage  from '@react-native-async-storage/async-storage';


const useAxios = () => {
    const navigate = useNavigation();

    const accessToken = AsyncStorage.getItem("access");
    const refreshToken = AsyncStorage.getItem("refresh");

    const baseURL = 'http://192.168.88.244:5000'

    const axiosInstance = axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    axiosInstance.interceptors.request.use(async (req: any) => {
        if (accessToken === null || refreshToken === null) {
            //navigate('LoginScreen');
            return req;
        }
        const decoded: any = jwt_decode(accessToken);
        const isExpired = dayjs.unix(decoded.exp).diff(dayjs()) < 1;

        if (!isExpired)
            return req;

        let response = await (await fetch(`${baseURL}/refresh`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${refreshToken}` }
        })).json();

        AsyncStorage.setItem('access', response.data.access);
        AsyncStorage.setItem('refresh', response.data.refresh);

        req.headers.Authorization = `Bearer ${response.data.access}`;
        return req;
    })

    return axiosInstance;
}

export default useAxios;