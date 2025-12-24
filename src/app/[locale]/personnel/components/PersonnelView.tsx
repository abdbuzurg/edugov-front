"use client"

import { PersonnelFilter, PersonnelProfile } from "@/types/personnel";
import ProfileCard from "./ProfileCard";
import { useEffect, useState } from "react";
import PersonnelFilterDialog from "./Filter";
import { FaFilter } from "react-icons/fa";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { personnelApi } from "@/api/personnel";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../loading";
import Loader from "@/components/Loader";

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
    workplace: "",
    limit: 15,
    locale: locale as string,
  })
  const [page, setPage] = useState(1)
  const [totalData, setTotalData] = useState(0)
  const [paginatedData, setPaginatedData] = useState<PersonnelProfile[]>([])
  const personnelQuery = useQuery<PersonnelProfile[], Error, PersonnelProfile[]>({
    queryKey: ["personnel", filterData, page],
    queryFn: () => personnelApi.getPersonnelPaginated(filterData, page)
  })
  useEffect(() => {
    if (personnelQuery.data && personnelQuery.isSuccess) {
      setPaginatedData(personnelQuery.data)
    }
  }, [personnelQuery.data])

  const personnelCountQuery = useQuery<number, Error, number>({
    queryKey: ["personnel-count", filterData],
    queryFn: () => personnelApi.getPersonnelCountPaginated(filterData)
  })
  useEffect(() => {
    if (personnelCountQuery.isSuccess && personnelCountQuery.data) {
      setTotalData(personnelCountQuery.data)
    }
  }, [personnelCountQuery.data])

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
            setFilterDisplayState={setFilterDisplayState}
            filterData={filterData}
            setFilterData={setFilterData}
            setPage={setPage}
          />
        }
        {(personnelQuery.isPending || personnelQuery.isLoading) &&
          <div className="flex justify-center">
            <Loader />
          </div>
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
                Саҳифаи <span className="font-bold">{page}</span> аз <span className="font-bold">{Math.floor(totalData / filterData.limit) + 1}</span>
              </p>
              <button
                type="submit"
                className={`py-2 px-4 ${page - 1 == 0 ? "bg-gray-400 text-black" : "bg-[#095088] hover:bg-blue-700 text-white cursor-pointer"} rounded`}
                disabled={page - 1 == 0}
                onClick={() => {
                  if (page - 1 != 0) setPage(page - 1)
                }}
              >{t("previousPageButtonText")}</button>
              <button
                type="submit"
                className={`py-2 px-4 ${page + 1 > Math.floor(totalData / filterData.limit) + 1 ? "bg-gray-400 text-black" : "bg-[#095088] hover:bg-blue-700 text-white cursor-pointer"} rounded `}
                disabled={page + 1 > Math.floor(totalData / filterData.limit) + 1}
                onClick={() => {
                  if (page + 1 < Math.floor(totalData / filterData.limit) + 1) setPage(page + 1)
                }}
              >{t("nextPageButtonText")}</button>
            </div>
          </>
        }
      </div>
    </div>
  )
}
