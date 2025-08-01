import { Me } from "@/types/me";
import axios from "axios";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { handleServerAuthRefresh } from "./serverAxios";
import { Employee } from "@/types/employee";

export const serverSideApi = {
  me: async (cookieStore: ReadonlyRequestCookies): Promise<Me | null> => {
    const accessToken = cookieStore.get("accessToken")

    if (!accessToken) {
      return null
    }

    try {
      const response = await axios.get<Me>(`${process.env.NEXT_PUBLIC_ACTUAL_BACKEND_URL}auth/me`, {
        adapter: 'fetch',
        fetchOptions: { cache: 'default' },
        headers: {
          "Authorization": `Bearer ${accessToken.value}`
        }
      })

      return response.data
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          const retry = await handleServerAuthRefresh<Me>(
            error.config!,
            cookieStore,
            "tg"
          )

          return retry
        } catch (retryError: any) {
          return null
        }
      }
      return null
    }
  },
  getEmployeeFullInfoByUID: async (uid: string, locale: string): Promise<Employee | null> => {
    try {
      const response = await axios.get<Employee>(`${process.env.NEXT_PUBLIC_ACTUAL_BACKEND_URL}employee/${uid}`, {
        adapter: 'fetch',
        fetchOptions: { cache: 'no-store' },
        headers: {
          'Accept-Language': locale,
        }
      })
      return response.data
    } catch (error: any) {
      return null
    }
  }
}