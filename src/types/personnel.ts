export type PersonnelProfile = {
  fullname: string
  uid: string
  highestAcademicDegree: string
  speciality: string
  currentWorkplace: string
  workExperienceMonths: number
  workExperienceYears: number
  socials?: PersonnelProfileSocials[]
}

type PersonnelProfileSocials = {
  name: string
  link: string
}

export type PersonnelFilter = {
  uid: string
  name: string
  surname: string
  middlename: string
  highestAcademicDegree: string
  speciality: string
  workExperience: number
  limit: number
}
