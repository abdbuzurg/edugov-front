export type Institution = {
  id: number
  yearOfEstablishment: number
  email: string
  fax: string
  createdAt: Date
  updatedAt: Date
  details: InstitutionDetails
  accreditation?: InstitutionAccreditation[]
  achievement?: InstitutionAchievement[]
  licence?: InstitutionLicense[]
}

export type InstitutionDetails = {
  id: number
  institutionTitle: string
  institutionType: string
  institutionAbbreviation?: string
  legalStatus: string
  mission: string
  founder: string
  legalAddress: string
  factualAddress?: string
  createdAt: Date
  updatedAt: Date
}

export type InstitutionAccreditation = {
  id: number
  accreditationType: string
  givenBy: string
  createdAt: Date
  updatedAt: Date
}

export type InstitutionAchievement = {
  id: number
  achievementTitle: string
  dateReceived: Date
  givenBy: string
  description: string
  linkToFile: string
  createdAt: Date
  updatedAt: Date
}

export type InstitutionLicense = {
  id: number
  licenceTitle: string
  givenBy: string
  linkToFole: string
  dateStart: Date
  dateEnd: Date
  createdAt: Date
  updatedAt: Date
}
