import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'; // Changed to Next.js app's base URL

const authAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending/receiving cookies (like HttpOnly refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default authAxios;
