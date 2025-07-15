import { Institution } from "@/types/institution";
import InstitutionMainInformationSection from "./components/InstitutionMainInformationSection";
import AccreditationInformationSection from "./components/AccreditationInformationSection";
import AchievementInformationSection from "./components/AchievementInformationSection";
import LicenceInformationSection from "./components/LicenceInformationSection";

const institution: Institution = {
  id: 1,
  yearOfEstablishment: 1991,
  email: "thethethe@gmail.com",
  fax: "+992939239923",
  updatedAt: new Date(),
  createdAt: new Date(),
  details: {
    id: 1,
    institutionTitle: "Таджикский Технологический Университет",
    institutionType: "университет",
    institutionAbbreviation: "ТТУ",
    legalStatus: "",
    mission: "МИССИЯ",
    founder: "ОСНОВАТЕЛЬ",
    legalAddress: "ЛЕГАЛЬНЫЙ АДРЕС",
    updatedAt: new Date(),
    createdAt: new Date(),
  },
  accreditation: [
    {
      id: 1,
      accreditationType: "ИМЯ АККРЕДИТАЦИИ",
      givenBy: "ИМЯ ОРГАНИЗАЦИЯ",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      accreditationType: "ИМЯ АККРЕДИТАЦИИ",
      givenBy: "ИМЯ ОРГАНИЗАЦИЯ",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  achievement: [
    {
      id: 1,
      achievementTitle: "За заслуги перед Отечеством",
      dateReceived: new Date("09/20/2015"),
      givenBy: "Государство",
      description: "За выдающиеся достижения в различных областях",
      linkToFile: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      achievementTitle: "Заслуженный деятель науки Российской Федерации 1",
      dateReceived: new Date("09/20/2015"),
      givenBy: "Государство",
      description: "За выдающиеся достижения в различных областях",
      linkToFile: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  licence: [
    {
      id: 1,
      licenceTitle: "Лицензия на осуществление образовательной деятельности 1",
      givenBy: "Государство",
      linkToFole: "",
      dateStart: new Date("09/20/2015"),
      dateEnd: new Date("09/20/2025"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      licenceTitle: "Лицензия на осуществление образовательной деятельности 2",
      givenBy: "Государство",
      linkToFole: "",
      dateStart: new Date("09/20/2015"),
      dateEnd: new Date("09/20/2025"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
}

export default function InstitutionProfile() {
  return (
    <div className="bg-white w-full">
      <div className="m-auto lg:w-[1280px] w-full flex">
        <div className="flex-1 flex space-x-4 py-4">
          <InstitutionMainInformationSection institution={institution} />
          <div className="flex-5  flex flex-col space-y-4">
            {institution.accreditation && <AccreditationInformationSection accreditations={institution.accreditation} />}
            {institution.achievement && <AchievementInformationSection achievements={institution.achievement} />}
            {institution.licence && <LicenceInformationSection licences={institution.licence} />}
          </div>
        </div>
      </div>
    </div>
  )
}
