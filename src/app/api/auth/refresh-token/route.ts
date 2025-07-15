import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // To access and set cookies
import { AuthResponse } from '@/api/auth';
import { ApiError } from '@/api/types';
import { accessTokenDuration, refreshTokenDuration } from '../login/route';

// Replace with the actual URL of your backend's token refresh endpoint
export const BACKEND_REFRESH_URL = process.env.BACKEND_REFRESH_URL || 'http://localhost:8080/auth/refresh-token';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  // Get the HttpOnly refresh token from the incoming request's cookies
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // If no refresh token is found, the user is not authenticated or session expired
  if (!refreshToken) {
    console.warn('Refresh token not found in cookies during refresh attempt.');
    // Clear any potentially stale access token cookie if refresh token is missing
    cookieStore.delete('accessToken');
    return NextResponse.json({ message: 'Authentication required: Refresh token missing.' }, { status: 401 });
  }

  try {
    // 1. Forward the refresh token to your actual backend authentication server
    // Note: The backend might expect the refresh token in the body or a header.
    // Here, we assume it expects it in the body for simplicity.
    const backendResponse = await fetch(BACKEND_REFRESH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // If your backend expects refresh token in Authorization header (less common for refresh)
        // 'Authorization': `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }), // Send refresh token to backend
    });

    // If backend fails to refresh the token (e.g., refresh token is expired/invalid)
    if (!backendResponse.ok) {
      const errorData: ApiError = await backendResponse.json();
      console.error('Backend refresh failed:', errorData.message, 'Status:', backendResponse.status);
      // Clear all authentication cookies if refresh fails
      cookieStore.delete('refreshToken');
      cookieStore.delete('accessToken');
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const data: AuthResponse = await backendResponse.json();
    // Your backend might optionally issue a new refresh token with each refresh.
    // If so, you'd get it from `data.refreshToken` and update the cookie below.
    // const newRefreshToken = data.refreshToken;

    // 2. Set the new non-HttpOnly access token cookie in the browser
    // This allows Server Components to read it and client-side JS to access it if needed.
    cookieStore.set({
      name: "access_token",
      value: data.accessToken,
      httpOnly: false, // NOT HttpOnly, accessible by client-side JS and server components
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: accessTokenDuration,
      path: '/',
    });

    cookieStore.set({
      name: "refreshToken",
      value: data.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshTokenDuration, // Example: one hour
      path: '/api/auth/refresh-token',
    });

    // 3. If your backend issues a new refresh token, update the HttpOnly cookie
    // This implements refresh token rotation for enhanced security.
    // if (newRefreshToken) {
    //   cookieStore.set('refreshToken', newRefreshToken, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: 'Lax',
    //     maxAge: 7 * 24 * 60 * 60 * 1000, // Match your backend's refresh token expiry
    //     path: '/',
    //   });
    // }

    // 4. Return the new access token to the client (for localStorage update)
    return NextResponse.json({ accessToken: data.accessToken }, { status: 200 });

  } catch (error: any) {
    console.error('Next.js API refresh route error:', error);
    // On any unexpected error, clear cookies and return internal server error
    cookieStore.delete('refreshToken');
    cookieStore.delete('accessToken');
    return NextResponse.json(
      { message: error.message || 'Internal server error during token refresh.' },
      { status: 500 }
    );
  }
}
