import ProfilePicture from "@/components/ProfilePicture";
import { PersonnelProfile } from "@/types/personnel";
import Link from "next/link";
import { BsMortarboardFill } from "react-icons/bs";
import { FaAddressCard, FaMicroscope, FaLandmark, FaClock, FaDatabase } from "react-icons/fa";

interface Props {
  employeeProfile: PersonnelProfile
  locale: string
}

export default function ProfileCard({ employeeProfile, locale }: Props) {
  let allPropertiesNotNull = true
  for (const key of Object.keys(employeeProfile) as Array<keyof PersonnelProfile>) {
    if (employeeProfile[key] === null || employeeProfile[key] === undefined) {
      allPropertiesNotNull = false;
      break;
    }
  }
  if (!allPropertiesNotNull) return null;

  return (
    <div className="flex border border-[#095088] rounded-2xl">
      <div className="flex-1 py-2 px-2 box-border flex flex-col gap-y-2 justify-center items-center text-center bg-[#095088] text-white rounded-l-[14px]">
        <div className="py-2">
          <ProfilePicture
            fallbackSrc={`/images/profile_placeholder_${locale}.svg`}
            src={`${process.env.NEXT_PUBLIC_ACTUAL_BACKEND_URL}employee/profile-picture/${employeeProfile.uid}`}
            alt={`personnel-profile-${employeeProfile.uid}`}
            className="rounded-full h-30 w-30"
          />
        </div>
        <p className="font-bold">{employeeProfile.fullname}</p>
        <Link href={`/${locale}/employee/${employeeProfile.uid}`} className="px-2 py-1 cursor-pointer bg-white text-[#095088] rounded mt-2">Профиль</Link>
      </div>
      <div className="flex-4">
        <div className="py-4 px-6 grid grid-cols-3 gap-x-10 gap-y-5">
          <div className=" py-2 px-4 rounded-2xl border-l-6 border-[#095088] bg-gray-100">
            <div className="flex gap-x-2 rounded-2xl">
              <div className="py-1">
                <FaAddressCard
                  size={26}
                  color="#095088"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-lg">NSID</p>
                <p className="font-semibold text-md">{employeeProfile.uid}</p>
              </div>
            </div>
          </div>
          <div className=" py-2 px-4 rounded-2xl border-l-6 border-[#095088] bg-gray-100">
            <div className="flex gap-x-2 rounded-2xl ">
              <div className="py-1">
                <BsMortarboardFill
                  size={26}
                  color="#095088"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-lg">Унвони Илми</p>
                <p className="font-semibold text-md">{employeeProfile.highestAcademicDegree}</p>
              </div>
            </div>
          </div>
          <div className=" py-2 px-4 rounded-2xl border-l-6 border-[#095088] bg-gray-100">
            <div className="flex gap-x-2 rounded-2xl ">
              <div className="py-1">
                <FaMicroscope
                  size={26}
                  color="#095088"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-lg">Ихтисоси Илми</p>
                <p className="font-semibold text-sm">{employeeProfile.speciality}</p>
              </div>
            </div>
          </div>
          <div className=" py-2 px-4 rounded-2xl border-l-6 border-[#095088] bg-gray-100">
            <div className="flex gap-x-2 rounded-2xl ">
              <div className="py-1">
                <FaLandmark
                  size={26}
                  color="#095088"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-lg">Чойи Кор</p>
                <p className="font-semibold text-sm">{employeeProfile.currentWorkplace}</p>
              </div>
            </div>
          </div>
          <div className=" py-2 px-4 rounded-2xl border-l-6 border-[#095088] bg-gray-100">
            <div className="flex gap-x-2 rounded-2xl ">
              <div className="py-1">
                <FaClock
                  size={26}
                  color="#095088"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-lg">Стажи кор</p>
                <p className="font-semibold text-sm">{employeeProfile.workExperience}</p>
              </div>
            </div>
          </div>
        </div>
        {employeeProfile.socials &&
          <>
            <hr />
            <div className="py-4 px-6 flex gap-x-2 w-full justify-around items-center">
              {employeeProfile.socials.map((v, i) => (
                <Link
                  key={i}
                  href={v.linkToSocial}
                  className="py-3 px-6 bg-gray-100 rounded-2xl border-l-4 border-gray-100 hover:border-l-4 hover:border-[#095088] cursor-pointer"
                >
                  <div className="flex-1 flex gap-x-2 text-lg">
                    <FaDatabase size={22} color="#095088" />
                    <p>{v.socialName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        }
      </div>
    </div>
  )
}