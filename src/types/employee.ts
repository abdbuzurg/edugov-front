import { BiLibrary } from "react-icons/bi"
import { PiChartPolarLight } from "react-icons/pi"

export type Employee = {
  id: number
  uniqueID: string
  createdAt: Date
  updatedAt: Date
  details: EmployeeDetails[]
  degrees?: EmployeeDegree[]
  workExperiences?: EmployeeWorkExperience[]
  mainResearchAreas?: EmployeeMainResearchArea[]
  publications?: EmployeePublication[]
  scientificAwards?: EmployeeScientificAward[]
  patents?: EmployeePatent[]
  participationInProfessionalCommunities?: EmployeeParticipationInProfessionalCommunity[]
  refresherCourses?: EmployeeRefrehserCourse[]
  socials?: EmployeeSocial[]
}

export type EmployeeDetails = {
  id: number
  languageCode: string
  employeeID: number
  surname: string
  name: string
  middlename: string
  isNewEmployeeDetails: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type EmployeeDegree = {
  id: number
  employeeID: number
  degreeLevel: string
  universityName: string
  speciality: string
  dateStart: Date
  dateEnd: Date
  givenBy: string
  dateDegreeRecieved: Date
  createdAt: Date
  updatedAt: Date
}

export type EmployeeWorkExperience = {
  id: number
  employeeID: number
  workplace: string
  jobTitle: string
  description: string
  dateStart: Date
  dateEnd: Date
  createdAt: Date
  updatedAt: Date
}

export type EmployeeMainResearchArea = {
  id: number
  area: string
  discipline: string
  keyTopics?: EmployeeMainResearchAreaKeyTopics[]
  createdAt: Date
  updatedAt: Date
}

export type EmployeeMainResearchAreaKeyTopics = {
  id: number
  keyTopicTitle: string
  createdAt: Date
  updatedAt: Date
}

export type EmployeePublication = {
  id: number
  employeeID: number
  publicationTitle: string
  linkToPublication: string
  createdAt: Date
  updatedAt: Date
}

export type EmployeeScientificAward = {
  id: number
  employeeID: number
  scientificAwardTitle: string
  givenBy: string
  createdAt: Date
  updatedAt: Date
}

export type EmployeePatent = {
  id: number
  employeeID: number
  patentTitle: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export type EmployeeParticipationInProfessionalCommunity = {
  id: number
  employeeID: number
  professionalCommunityTitle: string
  roleInProfessionalCommunity: string
  createdAt: Date
  updatedAt: Date
}

export type EmployeeRefrehserCourse = {
  id: number
  courseTitle: string
  dateStart: Date
  dateEnd: Date
  createdAt: Date
  updatedAt: Date
}

export type EmployeeSocial = {
  id: number
  employeeID: number
  socialName: string
  linkToSocial: string
  CreatedAt: Date
  UpdatedAt: Date
}

// E - library 
// google cholar
// scopu
// forcit
// web of science