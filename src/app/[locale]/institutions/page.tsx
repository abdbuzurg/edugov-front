import { serverSideApi } from "@/api/serverSide";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { FaCity, FaGraduationCap, FaLink, FaPhoneAlt } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdEmail } from "react-icons/md";

export const metadata: Metadata = {
  title: "Муассисаҳо"
}

export default async function Institutions(
  {
    params
  }: {
    params: Promise<{
      locale: string
    }>
  }
) {

  const t = await getTranslations("Institutions")
  const { locale } = await params;
  const allInstitutions = await serverSideApi.getAllInstitutions(locale)
  if (!allInstitutions) {
    notFound()
  }

  console.log(allInstitutions)

  return (
    <div className="bg-white w-full">
      <div className="m-auto lg:w-[1280px] w-full flex flex-col gap-x-4 gap-y-2 py-4 ">
        <div className="flex justify-between">
          <p className="font-bold text-2xl">{t("institutionTitle")}</p>
        </div>
        <div className="grid grid-cols-3 gap-x-15 gap-y-10">
          {allInstitutions.map((v, i) => (
            <div className="flex flex-col" key={i}>
              <div className="flex text-white flex-col gap-y-4 bg-[#095088] px-4 py-2 rounded-t-2xl">
                <div className="flex justify-between  ">
                  <FaGraduationCap
                    size={50}
                    color="#FFFFFF"
                  />
                  <div className="bg-white/30 text-white rounded-l-full rounded-r-full flex items-center py-1 px-2">
                    {v.mainIndex}
                  </div>
                </div>
                <p className="font-bold">{v.institutionTitleShort}</p>
                <div className="flex items-center">
                  <IoLocationOutline
                    size={30}
                    color="#FFFFFF"
                  />
                  <p>{v.city}</p>
                </div>
              </div>
              <div className="flex flex-col gap-y-3 px-10 py-6 bg-white border border-[#095088] rounded-b-2xl">
                <p className="font-semibold">{v.institutionTitleLong}</p>
                <div className="flex gap-x-4 items-center">
                  <FaCity
                    size={30}
                    color="#808080"
                  />
                  <p>{v.address}</p>
                </div>
                <div className="flex gap-x-4 items-center">
                  <FaLink
                    size={30}
                    color="#0000FF"
                  />
                  <p className="text-[#0000FF]">{v.officialWebsite}</p>
                </div>
                <div className="flex gap-x-4 items-center">
                  <MdEmail
                    size={30}
                    color="#008000"
                  />
                  <p className="text-[#008000]">{v.email}</p>
                </div>
                <div className="flex gap-x-4 items-center">
                  <FaPhoneAlt
                    size={30}
                    color="#800080"
                  />
                  <p className="text-[#800080]">{v.phoneNumber}</p>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}