export type Employee = {
  id: number
  uid: string
  createdAt: Date
  updatedAt: Date
  details: EmployeeDetails[]
  degree?: EmployeeDegree[]
  workExperience?: EmployeeWorkExperience[]
  mainResearchArea?: EmployeeMainResearchArea[]
  publication?: EmployeePublication[]
  scientificAward?: EmployeeScientificAward[]
  patent?: EmployeePatent[]
  participationInProfessionalCommunity?: EmployeeParticipationInProfessionalCommunity[]
  refresherCourse?: EmployeeRefrehserCourse[]
}

export type EmployeeDetails = {
  id: number
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
  degreeLevel: string
  recievedFrom: string
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
  publicationTitle: string
  linkToPublication: string
  createdAt: Date
  updatedAt: Date
}

export type EmployeeScientificAward = {
  id: number
  scientificAwardTitle: string
  givenBy: string
  linkToScientificAwardFile: string
  createdAt: Date
  updatedAt: Date
}

export type EmployeePatent = {
  id: number
  patentTitle: string
  description: string
  linkToPatentFile: string
  createdAt: Date
  updatedAt: Date
}

export type EmployeeParticipationInProfessionalCommunity = {
  id: number
  professionalCommunityTitle: string
  roleInProfessionalCommunity: string
  description: string
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
