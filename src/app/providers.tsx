"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { getQueryClient } from "./get-query-client"
import { useEffect } from "react";

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // Ensure client-side
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  useEffect(() => {
    const accessTokenFromCookie = getCookie('accessToken');
    const accessTokenFromLocalStorage = localStorage.getItem('accessToken');

    if (accessTokenFromCookie && accessTokenFromCookie !== accessTokenFromLocalStorage) {
      // If cookie has a newer/different token, update localStorage
      localStorage.setItem('accessToken', accessTokenFromCookie);
    } else if (!accessTokenFromCookie && accessTokenFromLocalStorage) {
      // If cookie is cleared but localStorage isn't, clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole')
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

