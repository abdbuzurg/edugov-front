// api/client.ts
import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { redirect } from 'next/navigation'; // For client-side redirects
import { AuthResponse } from './auth';

// Ensure this matches your backend's base URL
// Base URL for your backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/';

const clientAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending/receiving cookies (like HttpOnly refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Variables for managing the refresh token queue ---
let isRefreshing = false; // Flag to prevent multiple concurrent refresh requests
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = []; // Queue to hold failed requests while a refresh is in progress

/**
 * Processes the queue of failed requests after a token refresh attempt.
 * @param error - An error object if the refresh failed, otherwise null.
 * @param token - The new access token if the refresh was successful.
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); // Reject the promise if refresh failed
    } else {
      prom.resolve(token); // Resolve with the new token if refresh succeeded (to retry original request)
    }
  });
  failedQueue = []; // Clear the queue
};

// --- Request Interceptor ---
// This interceptor adds the access token to the Authorization header of outgoing requests.
clientAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Retrieve the access token from localStorage (where it's stored client-side)
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // If an access token exists, add it as a Bearer token to the Authorization header
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (typeof window !== 'undefined') { // Ensure localStorage is available (client-side)
      const currentLocale = localStorage.getItem('currentLocale');
      if (currentLocale) {
        config.headers['Accept-Language'] = currentLocale;
      }
    }
    return config; // Return the modified config
  },
  (error: AxiosError) => {
    // If there's an error in the request configuration, reject the promise
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// This interceptor handles responses, specifically detecting 401 Unauthorized errors
// to trigger the token refresh process.
clientAxios.interceptors.response.use(
  (response: AxiosResponse) => response, // If the response is successful, just pass it through
  async (error: AxiosError) => {
    const originalRequest = error.config; // Get the original request configuration

    // Check if the error is a 401 Unauthorized AND it's not a retry of the same request
    // AND it's not a request to the refresh endpoint itself (to prevent infinite loops)
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true; // Mark this original request as having been retried

      if (isRefreshing) {
        // If a token refresh is already in progress, queue the current failed request.
        // It will be retried once the ongoing refresh completes.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          // Once the refresh is done, retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return clientAxios(originalRequest);
        }).catch((err) => {
          return Promise.reject(err); // Propagate any error from the queued request
        });
      }

      isRefreshing = true; // Set flag to indicate a refresh is now in progress

      try {
        // Call your Next.js API route for token refresh.
        // This route will internally use the HttpOnly refresh token (sent automatically by browser)
        // to get a new access token from your authentication backend.
        const refreshResponse = await axios.post<AuthResponse>('api/auth/refresh');

        const { accessToken: newAccessToken } = refreshResponse.data;

        // Update the access token in localStorage for client-side use
        localStorage.setItem('accessToken', newAccessToken);

        // Process all requests that were queued while the refresh was happening
        processQueue(null, newAccessToken);

        // Retry the original failed request with the new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return clientAxios(originalRequest);
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        // If the refresh token itself is invalid or expired, clear client-side tokens
        localStorage.removeItem('accessToken');
        // The HttpOnly refresh token cookie should be cleared by your /api/auth/refresh route
        // if it fails to get a new token from your backend.

        // Reject all queued requests, indicating a full authentication failure
        processQueue(refreshError);
        // Redirect the user to the login page to re-authenticate
        const currentLocale = typeof window !== 'undefined' ? localStorage.getItem('currentLocale') : null;
        const redirectPath = currentLocale ? `/${currentLocale}/login` : '/login';
        redirect(redirectPath);
        return Promise.reject(refreshError); // Propagate the refresh error
      } finally {
        isRefreshing = false; // Reset the refreshing flag
      }
    }

    // For any other error status code (e.g., 400, 403, 500),
    // or if the 401 was a result of an already retried request,
    // simply reject the promise with the original error.
    // This allows your TanStack Query onError callbacks to catch these errors.
    return Promise.reject(error);
  }
);

export default clientAxios;
