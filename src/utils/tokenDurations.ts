export const accessTokenDuration = 2 * 60 * 60 * 1000;
export const refreshTokenDuration = 7 * 24 * 60 * 60 * 100;
export const BACKEND_REFRESH_URL = process.env.BACKEND_REFRESH_URL || 'http://localhost:8080/auth/refresh-token';
