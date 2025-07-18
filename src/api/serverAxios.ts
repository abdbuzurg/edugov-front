import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { AuthResponse } from "./auth";
import { accessTokenDuration, BACKEND_REFRESH_URL, refreshTokenDuration } from "@/utils/tokenDurations";

export const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * Creates an Axios instance specifically for Server Components.
 * It takes the 'cookies' object from 'next/headers' to access tokens
 * and the 'locale' to set the Accept-Language header.
 * @param cookieStore The cookies object obtained from `cookies()` in a Server Component.
 * @param locale The current locale string (e.g., 'en', 'ru', 'tg').
 * @returns An Axios instance configured for server-side requests.
 */
export function createServerAxios(cookieStore: ReadonlyRequestCookies, locale: string): AxiosInstance {
  const serverAxios = axios.create({
    baseURL: BACKEND_API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor: Add Authorization header and Accept-Language header
  serverAxios.interceptors.request.use(
    (config) => {
      const accessToken = cookieStore.get('accessToken')?.value;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // --- CHANGE: Use the passed 'locale' parameter directly for Accept-Language ---
      config.headers['Accept-Language'] = locale;
      // -----------------------------------------------------------------------------

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: This will continue to propagate the error (e.g., 401)
  // to the calling Server Component, which will then handle the refresh/redirect logic.
  serverAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('ServerAxios response error:', error.message);
      return Promise.reject(error);
    }
  );

  return serverAxios;
}

export async function handleServerAuthRefresh<T>(
  originalRequestConfig: AxiosRequestConfig,
  cookieStore: ReadonlyRequestCookies,
  locale: string
): Promise<T> {
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    console.log('No refresh token available for server-side refresh attempt.');
    cookieStore.delete('accessToken'); // Clear stale access token
    throw new Error('Authentication required: No refresh token');
  }

  try {
    // 1. Call your Next.js API route for token refresh
    // The browser automatically sends the HttpOnly refreshToken cookie with this request.
    const refreshResponse = await axios.post<AuthResponse>(BACKEND_REFRESH_URL);

    const newAccessToken = refreshResponse.data.accessToken;
    const newRefreshToken = refreshResponse.data.refreshToken;

    // 2. Crucially, set the new access token cookie in the current response
    // This makes the new token available for subsequent server-side renders
    // and for client-side hydration.
    cookieStore.set({
      name: "accessToken",
      value: newAccessToken,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: accessTokenDuration, // Example: one hour
      path: '/',
    });
    cookieStore.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshTokenDuration, // Example: one hour
      path: '/',
    });

    // 3. Retry the original request with the new access token
    // Create a new serverAxios instance with the updated cookieStore (containing new token)
    const retriedServerAxios = createServerAxios(cookieStore, locale);

    // Update the Authorization header in the original request config
    const retriedRequestConfig: AxiosRequestConfig = {
      ...originalRequestConfig,
      headers: {
        ...originalRequestConfig.headers,
        'Authorization': `Bearer ${newAccessToken}`,
        'Accept-Language': locale, // Ensure locale is also updated/set
      },
    };

    const retryResponse = await retriedServerAxios.request<T>(retriedRequestConfig);
    return retryResponse.data;

  } catch (refreshError: any) {
    console.error('Server-side token refresh and retry failed:', refreshError.message);
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    throw new Error('Failed to refresh authentication token'); // Propagate error
  }
}
