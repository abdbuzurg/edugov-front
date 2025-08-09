import { PersonnelFilter, PersonnelProfile } from "@/types/personnel"
import clientAxios from "./clientAxios"

export interface PersonnelPaginatedData {
  data: PersonnelFilter[]
  nextPage: number
}

export const personnelApi = {
  getPersonnelPaginated: async ({pageParam = 1}, filter: PersonnelFilter): Promise<PersonnelPaginatedData> => {
    const response = await clientAxios.get<PersonnelPaginatedData>(`/employee/personnel`, {
      params: {
        ...filter,
        limit: filter.profilePerPagination,
        page: pageParam
      }
    })
    return response.data
  },
} 