import { AuthTokens, TokenRefreshRequest, applyAuthTokenInterceptor } from 'react-native-axios-jwt'
import axios from 'axios'

const BASE_URL = 'http://192.168.88.244:5000'

// 1. Create an axios instance that you wish to apply the interceptor to
export const axiosInstance = axios.create({ baseURL: BASE_URL })

// 2. Define token refresh function.
const requestRefresh: TokenRefreshRequest = async (refreshToken: string): Promise<string> => {

  // Important! Do NOT use the axios instance that you supplied to applyAuthTokenInterceptor
  // because this will result in an infinite loop when trying to refresh the token.
  // Use the global axios client or a different instance
  const response = await axios.post(`${BASE_URL}/refresh`, { token: refreshToken })
  console.log("access token from auth.ts: ",response.data.access_token);
  

  return response.data.access_token
}

export interface ILoginRequest {
    email: string;
    password: string;
}

const header = "Authorization";
const headerPrefix = "Bearer";
// 3. Add interceptor to your axios instance
applyAuthTokenInterceptor(axiosInstance, { 
    requestRefresh
  })