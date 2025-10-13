"use client"

import { PersonnelFilter, PersonnelProfile } from "@/types/personnel";
import ProfileCard from "./ProfileCard";
import { useEffect, useState } from "react";
import PersonnelFilterDialog from "./Filter";
import { FaFilter } from "react-icons/fa";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { personnelApi, PersonnelPaginatedData } from "@/api/personnel";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../loading";

export const metadata: Metadata = {
  title: "Кадры"
}

interface Props {
  locale: string
}

export default function PersonnelView({ locale }: Props) {
  const t = useTranslations("Personnel")

  const [filterDisplayState, setFilterDisplayState] = useState(false)
  const [filterData, setFilterData] = useState<PersonnelFilter>({
    uid: "",
    name: "",
    surname: "",
    middlename: "",
    highestAcademicDegree: "",
    speciality: "",
    workExperience: 0,
    limit: 50,
    page: 1,
    locale: locale as string,
  })

  const [totalData, setTotalData] = useState(0)
  const [paginatedData, setPaginatedData] = useState<PersonnelProfile[]>([])
  const personnelQuery = useQuery<PersonnelPaginatedData, Error, PersonnelPaginatedData>({
    queryKey: ["personnel", filterData],
    queryFn: () => personnelApi.getPersonnelPaginated(filterData)
  })
  useEffect(() => {
    if (personnelQuery.data && personnelQuery.isSuccess) {
      setTotalData(personnelQuery.data.total)
      setPaginatedData(personnelQuery.data.data)
    }
  }, [personnelQuery.data])
  useEffect(() => {
    personnelQuery.refetch()
  }, [filterData])

  return (
    <div className="bg-white w-full">
      <div className="m-auto lg:w-[1280px] w-full flex flex-col gap-x-4 gap-y-2 py-4 ">
        <div className="flex justify-between">
          <p className="font-bold text-2xl">{t("pageTitle")}({totalData})</p>
          <div
            className="cursor-pointer"
            onClick={() => setFilterDisplayState(!filterDisplayState)}
          >
            <FaFilter color="#095088" size={32} />
          </div>
        </div>
        {filterDisplayState &&
          <PersonnelFilterDialog
            filterData={filterData}
            setFilterData={setFilterData}
          />
        }
        {(personnelQuery.isPending || personnelQuery.isLoading) &&
          <Loading />
        }
        {personnelQuery.isSuccess &&
          <>
            <div className="flex flex-col gap-y-7 w-full">
              {paginatedData.map(v => (
                <ProfileCard
                  key={v.uid}
                  locale={locale as string}
                  employeeProfile={v}
                />
              ))}
            </div>
            <div className="flex justify-end gap-x-2 items-center">
              <p className="">
                Саҳифаи <span className="font-bold">{filterData.page}</span> аз <span className="font-bold">{Math.floor(totalData / filterData.limit) + 1}</span>
              </p>
              <button
                type="submit"
                className={`py-2 px-4 ${filterData.page - 1 == 0 ? "bg-gray-400 text-black" : "bg-[#095088] hover:bg-blue-700 text-white cursor-pointer"} rounded`}
                disabled={filterData.page - 1 == 0}
                onClick={() => {
                  if (filterData.page - 1 != 0) setFilterData({ ...filterData, page: filterData.page - 1 })
                }}
              >{t("previousPageButtonText")}</button>
              <button
                type="submit"
                className={`py-2 px-4 ${filterData.page + 1 > Math.floor(totalData / filterData.limit) + 1 ? "bg-gray-400 text-black" : "bg-[#095088] hover:bg-blue-700 text-white cursor-pointer"} rounded `}
                disabled={filterData.page + 1 > Math.floor(totalData / filterData.limit) + 1}
                onClick={() => {
                  if (filterData.page + 1 < Math.floor(totalData / filterData.limit) + 1) setFilterData({ ...filterData, page: filterData.page + 1 })
                }}
              >{t("nextPageButtonText")}</button>
            </div>
          </>
        }
      </div>
    </div>
  )
}
