import { PersonnelFilter, PersonnelProfile } from "@/types/personnel"
import clientAxios from "./clientAxios"

export interface PersonnelPaginatedData {
  data: PersonnelProfile[]
  total: number
}

export const personnelApi = {
  getPersonnelPaginated: async (filter: PersonnelFilter): Promise<PersonnelPaginatedData> => {
    const response = await clientAxios.get<PersonnelPaginatedData>(`/employee/personnel`, {
      params: {
        ...filter,
      }
    })
    return response.data
  },
} 
