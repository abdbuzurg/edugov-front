import EmployeeMainInformationSection from "./components/EmployeeMainInformationSection";
import { Employee } from "@/types/employee";
import DegreeInformationSection from "./components/DegreeInformationSection";
import WorkExperienceInformationSection from "./components/WorkExperienceInformationSection";
import MainResearchAreaInformationSection from "./components/MainResearchAreaInformationSection";
import PublicationInformationSection from "./components/PublicationInfromationSection";
import ScientificAwardInformationSection from "./components/ScientificAwardInformationSection";
import PatentInformationSection from "./components/PatentInformationSection";
import ParticipationInProfessionalCommunityInformationSection from "./components/ParticipationInProfessionalCommunityInformationSection";
import RefresherCourseInformationSection from "./components/RefresherCourseInformationSection";
import { employeeApi } from "@/api/employee";
import { notFound } from "next/navigation";
import DetailsInformationSection from "./components/DetailsInformationSection";
import { cookies } from "next/headers";
import { createServerAxios, handleServerAuthRefresh } from "@/api/serverAxios";
import axios from "axios";

const employeeMock: Employee = {
  id: 1,
  uid: "akjsdhaklsjdhaklsd",
  createdAt: new Date(),
  updatedAt: new Date(),
  details: [
    {
      id: 1,
      employeeID: 1,
      surname: "Abdulloev",
      name: "Buzurgmehr",
      middlename: "Mamadamonovich",
      isNewEmployeeDetails: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      employeeID: 1,
      surname: "Mamadamonzoda",
      name: "Buzurgmehr",
      middlename: "Mamadamonovich",
      isNewEmployeeDetails: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      employeeID: 1,
      surname: "Mamadamonzoda1",
      name: "Buzurgmehr1",
      middlename: "Mamadamonovich1",
      isNewEmployeeDetails: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  degree: [
    {
      id: 1,
      degreeLevel: "Бакалавр",
      recievedFrom: "Университет Центральной Азии",
      speciality: "Компьютерная наука",
      dateStart: new Date("09/01/2016"),
      dateEnd: new Date("06/20/2021"),
      givenBy: "Университет Центральной Азии",
      dateDegreeRecieved: new Date("06/20/2021"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      degreeLevel: "Школа",
      recievedFrom: "Лицей МГУ",
      speciality: "Высшее образование",
      dateStart: new Date("09/01/2014"),
      dateEnd: new Date("06/20/2016"),
      givenBy: "Лицей МГУ",
      dateDegreeRecieved: new Date("20/06/2016"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  workExperience: [
    {
      id: 1,
      workplace: "ТГЭМ",
      jobTitle: "Фулстэк разработчик",
      description: "Фулстэк разработка программы для контроля склада. Включает в себя автоматическое создание отчётов и сбора данных",
      dateStart: new Date("03/09/2024"),
      dateEnd: new Date("04/01/2025"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      workplace: "Лицей Ага Хана",
      jobTitle: "Фулстэк разработчик",
      description: "Фулстэк разработка программы для контроля товарооборота куханных материалов включая оборот учебных материалов. Включает в себя автоматическое создание отчётов и сбора данных",
      dateStart: new Date("03/09/2024"),
      dateEnd: new Date("04/01/2025"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      workplace: "ТГЭМ",
      jobTitle: "Фулстэк разработчик",
      description: "Фулстэк разработка программы для контроля склада. Включает в себя автоматическое создание отчётов и сбора данных",
      dateStart: new Date("03/09/2024"),
      dateEnd: new Date("04/01/2025"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      workplace: "ТГЭМ",
      jobTitle: "Фулстэк разработчик",
      description: "Фулстэк разработка программы для контроля склада. Включает в себя автоматическое создание отчётов и сбора данных",
      dateStart: new Date("03/09/2024"),
      dateEnd: new Date("04/01/2025"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  mainResearchArea: [
    {
      id: 1,
      area: "Математика",
      discipline: "Алгебра",
      keyTopics: [
        {
          id: 1,
          keyTopicTitle: "Теория чисел и криптография.1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          keyTopicTitle: "Теория чисел и криптография.2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      area: "Математика1",
      discipline: "Алгебра1",
      keyTopics: [
        {
          id: 1,
          keyTopicTitle: "Теория чисел и криптография.3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          keyTopicTitle: "Теория чисел и криптография.4",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  publication: [
    {
      id: 1,
      publicationTitle: "Влияние климатических изменений на миграцию птиц",
      linkToPublication: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      publicationTitle: "Влияние климатических изменений на миграцию птиц Влияние климатических изменений на миграцию птиц Влияние климатических изменений на миграцию птиц",
      linkToPublication: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      publicationTitle: "Влияние климатических изменений на миграцию птиц123",
      linkToPublication: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  scientificAward: [
    {
      id: 1,
      scientificAwardTitle: "Нобелевская премия",
      givenBy: "Нобелевский фонд",
      linkToScientificAwardFile: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      scientificAwardTitle: "Нобелевская премия",
      givenBy: "Нобелевский фонд",
      linkToScientificAwardFile: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  patent: [
    {
      id: 1,
      patentTitle: "Способ получения углеродных нанотрубок 1 ",
      description: "Детальное описание процесса, включая оборудование, параметры, необходимые для проведения процесса, а также иллюстрации (чертежи, схемы)",
      linkToPatentFile: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      patentTitle: "Способ получения углеродных нанотрубок 2",
      description: "Детальное описание процесса, включая оборудование, параметры, необходимые для проведения процесса, а также иллюстрации (чертежи, схемы)",
      linkToPatentFile: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  participationInProfessionalCommunity: [
    {
      id: 1,
      professionalCommunityTitle: "Ассоциация врачей Таджикистана 1",
      roleInProfessionalCommunity: "Представление интересов организации, управление ее деятельностью и обеспечение ее развития",
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      professionalCommunityTitle: "Ассоциация врачей Таджикистана 2",
      roleInProfessionalCommunity: "Представление интересов организации, управление ее деятельностью и обеспечение ее развития",
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  refresherCourse: [
    {
      id: 1,
      courseTitle: "Управление персоналом и кадровое делопроизводство 1",
      dateStart: new Date("09/01/2014"),
      dateEnd: new Date("06/20/2016"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      courseTitle: "Управление персоналом и кадровое делопроизводство 2",
      dateStart: new Date("09/01/2014"),
      dateEnd: new Date("06/20/2016"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]
}

async function getEmployeeFullInfoByUID(uid: string, locale: string): Promise<Employee | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")
  const refreshToken = cookieStore.get("refreshToken")

  if (!accessToken && !refreshToken) {
    return null
  }

  const serverAxios = createServerAxios(cookieStore, locale)
  try {
    const response = await serverAxios.get<Employee>(`/employee/${uid}`)
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        const retry = await handleServerAuthRefresh<Employee>(
          error.config!,
          cookieStore,
          locale,
        )

        return retry
      } catch (retryError: any) {
        return null
      }
    }
    return null
  }
}

export default async function EmployeeProfile({
  params
}: {
  params: {
    locale: string
    uid: string
  }
}) {

  const { uid, locale } = await params;

  const employee = await getEmployeeFullInfoByUID(uid, locale)
  if (!employee) {
    notFound()
  }

  return (
    <div className="bg-white w-full">
      <div className="m-auto lg:w-[1280px] w-full flex">
        <div className="flex-1 flex space-x-4 py-4">
          <DetailsInformationSection details={employee.details} employeeID={employee.id} />
          <div className="flex-5  flex flex-col space-y-4">
            <DegreeInformationSection degree={employee.degree} employeeID={employee.id}/>
            {employeeMock.workExperience && <WorkExperienceInformationSection workExperience={employeeMock.workExperience} />}
            {employeeMock.mainResearchArea && <MainResearchAreaInformationSection mainResearchArea={employeeMock.mainResearchArea} />}
            {employeeMock.publication && <PublicationInformationSection publications={employeeMock.publication} />}
            {employeeMock.scientificAward && <ScientificAwardInformationSection scientificAwards={employeeMock.scientificAward} />}
            {employeeMock.patent && <PatentInformationSection patents={employeeMock.patent} />}
            {employeeMock.participationInProfessionalCommunity && <ParticipationInProfessionalCommunityInformationSection participationInProfessionalCommunities={employeeMock.participationInProfessionalCommunity} />}
            {employeeMock.refresherCourse && <RefresherCourseInformationSection refresherCourses={employeeMock.refresherCourse} />}
          </div>
        </div>
      </div>
    </div>
  )
}
