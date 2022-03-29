import { AuthTokens, TokenRefreshRequest, applyAuthTokenInterceptor } from 'react-native-axios-jwt'
import axios from 'axios'

interface IUrls{
  baseApiURL: string;
  baseAuthURL: string;
}

export const urls: IUrls = {
  // baseApiURL: 'http://192.168.88.244:80',
  // baseAuthURL: 'http://192.168.88.244:5000',
  baseApiURL: 'http://77.76.8.119:80',
  baseAuthURL: 'http://77.76.8.119:443',
}

export const axiosInstance = axios.create({ baseURL: urls.baseAuthURL })

const requestRefresh: TokenRefreshRequest = async (refreshToken: string): Promise<string> => {
  const response = await axios.post(`${urls.baseAuthURL}/refresh`, { token: refreshToken })
  return response.data.access_token
}

export interface ILoginRequest {
    email: string;
    password: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
}

applyAuthTokenInterceptor(axiosInstance, { 
    requestRefresh
  })
