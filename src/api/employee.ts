import { EmployeeDegree, EmployeeDetails } from "@/types/employee"
import clientAxios from "./clientAxios"

const rootURL = "/employee"
const detailsURL = "/details"
const degreeURL = "/degree"

export const employeeApi = {

  getDetailsByEmployeeID: async (employeeID: number): Promise<EmployeeDetails[]> => {
    const response = await clientAxios.get<EmployeeDetails[]>(`${rootURL}${detailsURL}/${employeeID}`)
    return response.data
  },
  updateDetails: async (details: EmployeeDetails[]): Promise<EmployeeDetails[]> => {
    const response = await clientAxios.put<EmployeeDetails[]>(`${rootURL}${detailsURL}`, { data: details })
    return response.data
  },
  getDegreesByEmployeeID: async (employeeID: number): Promise<EmployeeDegree[]> => {
    const response = await clientAxios.get<EmployeeDegree[]>(`${rootURL}${degreeURL}/${employeeID}`)
    return response.data
  },
  createDegree: async (degree: EmployeeDegree): Promise<EmployeeDegree> => {
    const response = await clientAxios.post<EmployeeDegree>(`${rootURL}${degreeURL}`, degree)
    return response.data
  },
  updateDegree: async (degree: EmployeeDegree): Promise<EmployeeDegree> => {
    const response = await clientAxios.put<EmployeeDegree>(`${rootURL}${degreeURL}`, degree)
    return response.data
  },
  deleteDegree: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${degreeURL}/${id}`)
  }
}
