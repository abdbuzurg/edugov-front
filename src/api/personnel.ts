import { PersonnelFilter, PersonnelProfile } from "@/types/personnel"
import clientAxios from "./clientAxios"

export const personnelApi = {
  getPersonnelPaginated: async (filter: PersonnelFilter, page: number): Promise<PersonnelProfile[]> => {
    const response = await clientAxios.get<PersonnelProfile[]>(`/employee/personnel`, {
      params: {
        ...filter,
        page: page,
      }
    })
    return response.data
  },
  getPersonnelCountPaginated: async (filter: PersonnelFilter): Promise<number> => {
    const response = await clientAxios.get<number>(`/employee/personnel/count`, {
      params: {
        ...filter,
      }
    })

    return response.data
  }
} 
