export type PersonnelProfile = {
  fullname: string
  uid: string
  highestAcademicDegree: string
  speciality: string
  currentWorkplace: string
  workExperience: number
  socials?: PersonnelProfileSocials[]
}

type PersonnelProfileSocials = {
  socialName: string
  linkToSocial: string
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
  locale: string
}
