import { EmployeeDegree, EmployeeDetails, EmployeeMainResearchArea, EmployeeParticipationInEvent, EmployeeParticipationInProfessionalCommunity, EmployeePatent, EmployeePublication, EmployeeRefresherCourse, EmployeeResearchActivity, EmployeeScientificAward, EmployeeSocial, EmployeeWorkExperience } from "@/types/employee"
import clientAxios from "./clientAxios"

const rootURL = "/employee"

const detailsURL = "/details"
const degreeURL = "/degree"
const workExperienceURL = "/work-experience"
const publicationURL = "/publication"
const scientificAwardURL = "/scientific-award"
const patentURL = "/patent"
const pipcURL = "/pipc"
const socialURL = "/social"
const refresherCourseURL = "/refresher-course"
const pieURL = "/pie"
const researchActivityURL = "/research-activity"
const mraURL = "/mra"

export const employeeApi = {

  getDetailsByEmployeeID: async (employeeID: number): Promise<EmployeeDetails[]> => {
    const response = await clientAxios.get<EmployeeDetails[]>(`${rootURL}${detailsURL}/${employeeID}`)
    return response.data
  },
  updateProfilePicture: async ({ profilePicture, uid }: { profilePicture: File, uid: string }): Promise<void> => {
    const formData = new FormData()
    formData.append("profilePicture", profilePicture)
    await clientAxios.put(`${rootURL}/profile-picture/${uid}`, formData)
  },
  getProfilePicture: async (uid: string): Promise<string> => {
    const response = await clientAxios.get<string>(`${rootURL}/profile-picture/${uid}`)
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
  },
  getWorkExperienceByEmployeeID: async (employeeID: number): Promise<EmployeeWorkExperience[]> => {
    const response = await clientAxios.get<EmployeeWorkExperience[]>(`${rootURL}${workExperienceURL}/${employeeID}`)
    return response.data
  },
  createWorkExperience: async (workExperience: EmployeeWorkExperience): Promise<EmployeeWorkExperience> => {
    const response = await clientAxios.post<EmployeeWorkExperience>(`${rootURL}${workExperienceURL}`, workExperience)
    return response.data
  },
  updateWorkExperience: async (workExperience: EmployeeWorkExperience): Promise<EmployeeWorkExperience> => {
    const response = await clientAxios.put<EmployeeWorkExperience>(`${rootURL}${workExperienceURL}`, workExperience)
    return response.data
  },
  deleteWorkExprience: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${workExperienceURL}/${id}`)
  },
  getPublicationByEmployeeID: async (employeeID: number): Promise<EmployeePublication[]> => {
    const response = await clientAxios.get<EmployeePublication[]>(`${rootURL}${publicationURL}/${employeeID}`)
    return response.data
  },
  createPublication: async (publication: EmployeePublication): Promise<EmployeePublication> => {
    const response = await clientAxios.post(`${rootURL}${publicationURL}`, publication)
    return response.data
  },
  updatePublication: async (publication: EmployeePublication): Promise<EmployeePublication> => {
    const response = await clientAxios.put(`${rootURL}${publicationURL}`, publication)
    return response.data
  },
  deletePublication: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${publicationURL}/${id}`)
  },
  getScientificAwardByEmployeeID: async (employeeID: number): Promise<EmployeeScientificAward[]> => {
    const response = await clientAxios.get<EmployeeScientificAward[]>(`${rootURL}${scientificAwardURL}/${employeeID}`)
    return response.data
  },
  createScientificAward: async (scientificAward: EmployeeScientificAward): Promise<EmployeeScientificAward> => {
    const response = await clientAxios.post<EmployeeScientificAward>(`${rootURL}${scientificAwardURL}`, scientificAward)
    return response.data
  },
  updateScientificAward: async (scientificAward: EmployeeScientificAward): Promise<EmployeeScientificAward> => {
    const response = await clientAxios.put<EmployeeScientificAward>(`${rootURL}${scientificAwardURL}`, scientificAward)
    return response.data
  },
  deleteScientificAward: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${scientificAwardURL}/${id}`)
  },
  getPatentByEmployeeID: async (employeeID: number): Promise<EmployeePatent[]> => {
    const response = await clientAxios.get<EmployeePatent[]>(`${rootURL}${patentURL}/${employeeID}`)
    return response.data
  },
  createPatent: async (patent: EmployeePatent): Promise<EmployeePatent> => {
    const response = await clientAxios.post<EmployeePatent>(`${rootURL}${patentURL}`, patent)
    return response.data
  },
  updatePatent: async (patent: EmployeePatent): Promise<EmployeePatent> => {
    const response = await clientAxios.put<EmployeePatent>(`${rootURL}${patentURL}`, patent)
    return response.data
  },
  deletePatent: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${patentURL}/${id}`)
  },
  getPIPCByEmployeeID: async (employeeID: number): Promise<EmployeeParticipationInProfessionalCommunity[]> => {
    const response = await clientAxios.get<EmployeeParticipationInProfessionalCommunity[]>(`${rootURL}${pipcURL}/${employeeID}`)
    return response.data
  },
  createPIPC: async (pipc: EmployeeParticipationInProfessionalCommunity): Promise<EmployeeParticipationInProfessionalCommunity> => {
    const response = await clientAxios.post<EmployeeParticipationInProfessionalCommunity>(`${rootURL}${pipcURL}`, pipc)
    return response.data
  },
  updatePIPC: async (pipc: EmployeeParticipationInProfessionalCommunity): Promise<EmployeeParticipationInProfessionalCommunity> => {
    const response = await clientAxios.put<EmployeeParticipationInProfessionalCommunity>(`${rootURL}${pipcURL}`, pipc)
    return response.data
  },
  deletePIPC: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${pipcURL}/${id}`)
  },
  getSocialByEmployeeID: async (employeeID: number): Promise<EmployeeSocial[]> => {
    const response = await clientAxios.get(`${rootURL}${socialURL}/${employeeID}`)
    return response.data
  },
  createSocial: async (social: EmployeeSocial): Promise<EmployeeSocial> => {
    const response = await clientAxios.post<EmployeeSocial>(`${rootURL}${socialURL}`, social)
    return response.data
  },
  updateSocial: async (social: EmployeeSocial): Promise<EmployeeSocial> => {
    const response = await clientAxios.put<EmployeeSocial>(`${rootURL}${socialURL}`, social)
    return response.data
  },
  deleteSocial: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${socialURL}/${id}`)
  },
  getRefresheerCoursesByEmployeeID: async (employeeID: number): Promise<EmployeeRefresherCourse[]> => {
    const response = await clientAxios.get<EmployeeRefresherCourse[]>(`${rootURL}${refresherCourseURL}/${employeeID}`)
    return response.data
  },
  createRefresherCourse: async (refresherCourse: EmployeeRefresherCourse): Promise<EmployeeRefresherCourse> => {
    const response = await clientAxios.post<EmployeeRefresherCourse>(`${rootURL}${refresherCourseURL}`, refresherCourse)
    return response.data
  },
  updateRefresherCourse: async (refresherCourse: EmployeeRefresherCourse): Promise<EmployeeRefresherCourse> => {
    const response = await clientAxios.put<EmployeeRefresherCourse>(`${rootURL}${refresherCourseURL}`, refresherCourse)
    return response.data
  },
  deleteRefresherCourse: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${refresherCourseURL}/${id}`)
  },
  getPIEByEmployeeID: async (employeeID: number): Promise<EmployeeParticipationInEvent[]> => {
    const response = await clientAxios.get<EmployeeParticipationInEvent[]>(`${rootURL}${pieURL}/${employeeID}`)
    return response.data
  },
  createPIE: async (pie: EmployeeParticipationInEvent): Promise<EmployeeParticipationInEvent> => {
    const response = await clientAxios.post<EmployeeParticipationInEvent>(`${rootURL}${pieURL}`, pie)
    return response.data
  },
  updatePIE: async (pie: EmployeeParticipationInEvent): Promise<EmployeeParticipationInEvent> => {
    const response = await clientAxios.put<EmployeeParticipationInEvent>(`${rootURL}${pieURL}`, pie)
    return response.data
  },
  deletePIE: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${pieURL}/${id}`)
  },
  getResearchActivityByEmployeeID: async (employeeID: number): Promise<EmployeeResearchActivity[]> => {
    const response = await clientAxios.get<EmployeeResearchActivity[]>(`${rootURL}${researchActivityURL}/${employeeID}`)
    return response.data
  },
  createResearchActivity: async (researchActivity: EmployeeResearchActivity): Promise<EmployeeResearchActivity> => {
    const response = await clientAxios.post<EmployeeResearchActivity>(`${rootURL}${researchActivityURL}`, researchActivity)
    return response.data
  },
  updateResearchActivity: async (researchActivity: EmployeeResearchActivity): Promise<EmployeeResearchActivity> => {
    const response = await clientAxios.put<EmployeeResearchActivity>(`${rootURL}${researchActivityURL}`, researchActivity)
    return response.data
  },
  deleteResearchActivity: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${researchActivityURL}/${id}`)
  },
  getMRAEmployeeID: async(employeeID: number): Promise<EmployeeMainResearchArea[]> => {
    const response = await clientAxios.get<EmployeeMainResearchArea[]>(`${rootURL}${mraURL}/${employeeID}`)
    return response.data
  },
  createMRA: async (mra: EmployeeMainResearchArea): Promise<EmployeeMainResearchArea> => {
    const response = await clientAxios.post<EmployeeMainResearchArea>(`${rootURL}${mraURL}`, mra)
    return response.data
  },
  updateMRA: async (mra: EmployeeMainResearchArea): Promise<EmployeeMainResearchArea> => {
    const response = await clientAxios.put<EmployeeMainResearchArea>(`${rootURL}${mraURL}`, mra)
    return response.data
  },
  deleteMRA: async (id: number): Promise<void> => {
    await clientAxios.delete(`${rootURL}${mraURL}/${id}`)
  },
}
