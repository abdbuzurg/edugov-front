import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies function to set cookies
import { AuthRequest, AuthResponse } from '@/api/auth'; // Import your types
import { ApiError } from '@/api/types';
import { accessTokenDuration, refreshTokenDuration } from '@/utils/tokenDurations';

// Replace with the actual URL of your backend's login endpoint
const BACKEND_LOGIN_URL = process.env.BACKEND_LOGIN_URL;

export async function POST(request: Request) {
  try {
    const { email, password }: AuthRequest = await request.json();

    // 1. Forward credentials to your actual backend authentication server
    const backendResponse = await fetch(BACKEND_LOGIN_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // If backend authentication fails, propagate the error
    if (!backendResponse.ok) {
      const errorData: ApiError = await backendResponse.json();
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const authData: AuthResponse = await backendResponse.json();
    // Note: Your actual backend should set the HttpOnly refresh token cookie
    // in its response. When `fetch` above receives it, Next.js's underlying
    // environment will handle that HttpOnly cookie.

    // 2. Set the non-HttpOnly access token cookie for server-side component access
    // This cookie is readable by client-side JS and sent with server-side requests.
    const cookieStore = await cookies();
    cookieStore.set({
      name: "accessToken",
      value: authData.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: accessTokenDuration, // Example: one hour
      path: '/',
    });

    cookieStore.set({
      name: "refreshToken",
      value: authData.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshTokenDuration, // Example: one hour
      path: '/',
    });

    // 3. Return the access token and user data to the client
    // The client-side apiClient will read this accessToken from the body
    // and store it in localStorage.
    return NextResponse.json({...authData, refreshToken: ""}, { status: 200 });

  } catch (error: any) {
    console.error('Login API route error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
