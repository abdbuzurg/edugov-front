import { Me } from "@/types/me"
import authAxios from "./authAxios"
import clientAxios from "./clientAxios"

export type AuthRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  uid: string
  userRole: string
}

export const authApi = {
  register: async (credentials: AuthRequest): Promise<boolean> => {
    const response = await clientAxios.post(`auth/register`, credentials)
    return response.status === 201
  },
  login: async (credentials: AuthRequest): Promise<AuthResponse> => {
    const response = await authAxios.post<AuthResponse>(`api/auth/login`, credentials)
    return response.data
  },
  logout: async (): Promise<void> => {
    await authAxios.post(`api/auth/logout`)
  },
}
