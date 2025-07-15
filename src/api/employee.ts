import { EmployeeDetails } from "@/types/employee"
import clientAxios from "./clientAxios"

const rootURL = "/employee"
const detailsURL = "/details"

export const employeeApi = {
  
  getDetails: async (employeeID: number): Promise<EmployeeDetails[]> => {
    const response = await clientAxios.get<EmployeeDetails[]>(`${rootURL}${detailsURL}/${employeeID}`)
    return response.data
  },
  updateDetails: async (details: EmployeeDetails[]): Promise<EmployeeDetails[]> => {
    const response = await clientAxios.put<EmployeeDetails[]>(`${rootURL}${detailsURL}`, {data: details})
    return response.data
  },
}
