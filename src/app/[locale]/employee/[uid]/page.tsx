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
import { serverSideApi } from "@/api/serverSide";
import SocialInformationSection from "./components/SocialInformationSections";
import ParticipationInEventInfromationSection from "./components/ParticipationInEventInformationSection";
import ResearchActivityInformationSection from "./components/ResearchActivityInformationSection";

export const dynamic = "force-dynamic"


export default async function EmployeeProfile({
  params
}: {
  params: Promise<{
    locale: string
    uid: string
  }>
}) {
  const { uid, locale } = await params;
  const cookieStore = await cookies()

  const employee = await serverSideApi.getEmployeeFullInfoByUID(uid, locale)
  if (!employee) {
    notFound()
  }

  let isCurrentUserProfile: boolean
  const currentUser = await serverSideApi.me(cookieStore)
  if (!currentUser) {
    isCurrentUserProfile = false
  } else {
    isCurrentUserProfile = currentUser.uniqueID == employee.uniqueID
  }

  return (
    <div className="bg-white w-full">
      <div className="m-auto lg:w-[1280px] w-full flex gap-x-4 py-4">
        <div className="flex-1 flex flex-col gap-y-4">
          <DetailsInformationSection
            details={employee.details}
            employeeID={employee.id}
            locale={locale}
            uid={employee.uniqueID}
            isCurrentUserProfile={isCurrentUserProfile}
          />
          {(isCurrentUserProfile || employee.socials) &&
            <SocialInformationSection
              socials={employee.socials}
              employeeID={employee.id}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
        </div>
        <div className="flex-5  flex flex-col gap-y-4">
          {(isCurrentUserProfile || employee.degrees) &&
            <DegreeInformationSection
              degree={employee.degrees}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
          {(isCurrentUserProfile || employee.workExperiences) &&
            <WorkExperienceInformationSection
              workExperience={employee.workExperiences}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
          {/* {employeeMock.mainResearchAreas && <MainResearchAreaInformationSection mainResearchArea={employeeMock.mainResearchAreas} />} */}

          {(isCurrentUserProfile || employee.publications) &&
            <PublicationInformationSection
              publications={employee.publications}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
          {(isCurrentUserProfile || employee.scientificAwards) &&
            <ScientificAwardInformationSection
              scientificAwards={employee.scientificAwards}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
          {(isCurrentUserProfile || employee.patents) &&
            <PatentInformationSection
              patents={employee.patents}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
          {(isCurrentUserProfile || employee.participationInProfessionalCommunities) &&
            <ParticipationInProfessionalCommunityInformationSection
              pipcs={employee.participationInProfessionalCommunities}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
          {(isCurrentUserProfile || employee.refresherCourses) &&
            <RefresherCourseInformationSection
              refresherCourses={employee.refresherCourses}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
          {(isCurrentUserProfile || employee.refresherCourses) &&
            <ParticipationInEventInfromationSection
              participationInEvents={employee.participationInEvents}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
          {(isCurrentUserProfile || employee.refresherCourses) &&
            <ResearchActivityInformationSection
              researchActivities={employee.researchActivities}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
          {(isCurrentUserProfile || employee.refresherCourses) &&
            <MainResearchAreaInformationSection
              mainResearchAreas={employee.mainResearchAreas}
              employeeID={employee.id}
              locale={locale}
              isCurrentUserProfile={isCurrentUserProfile}
            />
          }
        </div>
      </div>
    </div>
  )
}
