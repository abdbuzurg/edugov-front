"use client"

import { PersonnelFilter, PersonnelProfile } from "@/types/personnel";
import ProfileCard from "./ProfileCard";
import { useCallback, useEffect, useRef, useState } from "react";
import PersonnelFilterDialog from "./Filter";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiError } from "@/api/types";
import { personnelApi, PersonnelPaginatedData } from "@/api/personnel";
import { FaFilter } from "react-icons/fa";
import { Metadata } from "next";
import Loading from "../../loading";
import { useTranslations } from "next-intl";

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
    limit: 10,
    locale: locale as string,
  })

  const [paginatedData, setPaginatedData] = useState<PersonnelProfile[]>([])
  const {
    data: personnelPaginatedData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isPending
  } = useInfiniteQuery<
    PersonnelPaginatedData,
    AxiosError<ApiError>,
    InfiniteData<PersonnelPaginatedData>,
    readonly (string | PersonnelFilter)[],
    number
  >({
    queryKey: ["personnel", { ...filterData }],
    queryFn: ({ pageParam }) => personnelApi.getPersonnelPaginated({ pageParam }, filterData),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined
  })
  useEffect(() => {
    if (personnelPaginatedData) {
      setPaginatedData([
        ...personnelPaginatedData.pages.reduce<PersonnelProfile[]>((acc, page) => [...acc, ...page.data], [])
      ])
    }
  }, [personnelPaginatedData])

  const observer = useRef<HTMLDivElement | null>(null)

  const handleScroll = useCallback(() => {
    const triggerElement = observer.current;
    if (!triggerElement) {
      return;
    }

    const { bottom } = triggerElement.getBoundingClientRect();
    const { clientHeight } = document.documentElement;

    if (bottom <= clientHeight && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    const currentObserver = observer.current;

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);


  return (
    <div className="bg-white w-full">
      <div className="m-auto lg:w-[1280px] w-full flex flex-col gap-x-4 gap-y-2 py-4 ">
        <div className="py-2 flex justify-between">
          <p className="font-bold text-2xl">{t("pageTitle")}</p>
          <div
            className="cursor-pointer"
            onClick={() => setFilterDisplayState(true)}
          >
            <FaFilter color="#095088" size={32} />
          </div>
          <PersonnelFilterDialog
            isOpen={filterDisplayState}
            onClose={() => setFilterDisplayState(false)}
            filterData={filterData}
            setFilterData={setFilterData}
          />
        </div>
        <div className="flex flex-col gap-y-7 w-full">
          {paginatedData.map(v => (
            <ProfileCard
              key={v.uid}
              locale={locale as string}
              employeeProfile={v}
            />
          ))}
          {isPending &&
            <div>
              <Loading />
            </div>
          }
        </div>
        <div ref={observer} style={{ height: '1px' }} />
      </div>
    </div>
  )
}
