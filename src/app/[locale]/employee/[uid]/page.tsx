import { Employee } from "@/types/employee";
import DegreeInformationSection from "./components/DegreeInformationSection";
import WorkExperienceInformationSection from "./components/WorkExperienceInformationSection";
import MainResearchAreaInformationSection from "./components/MainResearchAreaInformationSection";
import PublicationInformationSection from "./components/PublicationInfromationSection";
import ScientificAwardInformationSection from "./components/ScientificAwardInformationSection";
import PatentInformationSection from "./components/PatentInformationSection";
import ParticipationInProfessionalCommunityInformationSection from "./components/ParticipationInProfessionalCommunityInformationSection";
import RefresherCourseInformationSection from "./components/RefresherCourseInformationSection";
import { notFound } from "next/navigation";
import DetailsInformationSection from "./components/DetailsInformationSection";
import { cookies } from "next/headers";
import { createServerAxios, handleServerAuthRefresh } from "@/api/serverAxios";
import axios from "axios";
import { Me } from "@/types/me";

export const dynamic = "force-dynamic"

async function me(): Promise<Me | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")

  if (!accessToken) {
    return null
  }
  
  try {
    console.log(accessToken)
    const response = await axios.get<Me>(`${process.env.NEXT_PUBLIC_ACTUAL_BACKEND_URL}auth/me`, {
      adapter: 'fetch',
      fetchOptions: { cache: 'default' },
      headers: {
        "Authorization": `Bearer ${accessToken.value}`
      }
    })
    
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        const retry = await handleServerAuthRefresh<Employee>(
          error.config!,
          cookieStore,
          "tg"
        )

        return retry
      } catch (retryError: any) {
        return null
      }
    }
    return null
  }
}

async function getEmployeeFullInfoByUID(uid: string, locale: string): Promise<Employee | null> {
  try {
    const response = await axios.get<Employee>(`${process.env.NEXT_PUBLIC_ACTUAL_BACKEND_URL}employee/${uid}`, {
      adapter: 'fetch',
      fetchOptions: { cache: 'no-store' },
      headers: {
        'Accept-Language': locale,
      }
    })
    return response.data
  } catch (error: any) {
    return null
  }
}



export default async function EmployeeProfile({
  params
}: {
  params: Promise<{
    locale: string
    uid: string
  }>
}) {
  const { uid, locale } = await params;

  const employee = await getEmployeeFullInfoByUID(uid, locale)
  if (!employee) {
    notFound()
  }

  let isCurrentUserProfile: boolean
  const currentUser = await me()
  if (!currentUser) {
    isCurrentUserProfile = false
  } else {
    isCurrentUserProfile = currentUser.uniqueID == employee.uniqueID
  }

  return (
    <div className="bg-white w-full">
      <div className="m-auto lg:w-[1280px] w-full flex">
        <div className="flex-1 flex space-x-4 py-4">
          <DetailsInformationSection
            details={employee.details}
            employeeID={employee.id}
            locale={locale}
            uid={employee.uniqueID}
            isCurrentUserProfile={isCurrentUserProfile}
          />
          <div className="flex-5  flex flex-col space-y-4">
            <DegreeInformationSection
              degree={employee.degrees}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
            <WorkExperienceInformationSection
              workExperience={employee.workExperiences}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
            {/* {employeeMock.mainResearchAreas && <MainResearchAreaInformationSection mainResearchArea={employeeMock.mainResearchAreas} />} */}
            <PublicationInformationSection
              publications={employee.publications}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
            <ScientificAwardInformationSection
              scientificAwards={employee.scientificAwards}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
            <PatentInformationSection
              patents={employee.patents}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
            <ParticipationInProfessionalCommunityInformationSection
              pipcs={employee.participationInProfessionalCommunities}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
            {/* {employeeMock.refresherCourses && <RefresherCourseInformationSection refresherCourses={employeeMock.refresherCourses} />} */}
          </div>
        </div>
      </div>
    </div>
  )
}
