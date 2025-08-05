import { Me } from "@/types/me";
import axios from "axios";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { handleServerAuthRefresh } from "./serverAxios";
import { Employee } from "@/types/employee";
import { cache } from "react";

export const serverSideApi = {
  me: cache(async (cookieStore: ReadonlyRequestCookies): Promise<Me | null> => {
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return null
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ACTUAL_BACKEND_URL}auth/me`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        }
      })
      return await response.json()
    } catch (error: any) {
      return null
    }
  }),
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