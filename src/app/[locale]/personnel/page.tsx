"use client"

import { PersonnelFilter, PersonnelProfile } from "@/types/personnel";
import ProfileCard from "./components/ProfileCard";
import { useCallback, useEffect, useRef, useState } from "react";
import PersonnelFilterDialog from "./components/Filter";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiError } from "@/api/types";
import { personnelApi, PersonnelPaginatedData } from "@/api/personnel";
import { FaFilter } from "react-icons/fa";

const dummyData: PersonnelProfile[] = [
  {
    uid: "1234-5678",
    currentWorkplace: "ДТТ ба номи академик М.С.Осими",
    fullname: "Рахмонзода Ахмадшо Чалолиддин",
    highestAcademicDegree: "Номзади илм",
    speciality: "Конструксияхои сохтмони бинохо ва иншоот",
    workExperience: 15
  }
]

export default function Personnel() {

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
  })

  const personnelDataQuery = useInfiniteQuery<PersonnelPaginatedData, AxiosError<ApiError>, InfiniteData<PersonnelPaginatedData>, readonly (string | PersonnelFilter)[], number>({
    queryKey: ["personnel", filterData],
    queryFn: ({ pageParam }) => personnelApi.getPersonnelPaginated({ pageParam }, filterData),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined
  })

  const observer = useRef<HTMLDivElement | null>(null)

  const handleScroll = useCallback(() => {
    const triggerElement = observer.current;
    if (!triggerElement) {
      return; 
    }

    const { bottom } = triggerElement.getBoundingClientRect();
    const { clientHeight } = document.documentElement;

    if (bottom <= clientHeight && personnelDataQuery.hasNextPage && !personnelDataQuery.isFetchingNextPage) {
      personnelDataQuery.fetchNextPage();
    }
  }, [personnelDataQuery.hasNextPage, personnelDataQuery.isFetchingNextPage, personnelDataQuery])

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
          <p className="font-bold text-2xl">Научно-педагогические кадры</p>
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
          {dummyData.map(v => (
            <ProfileCard
              key={v.uid}
              employeeProfile={v}
            />
          ))}
        </div>
        <div ref={observer} style={{height: '1px'}} />
      </div>
    </div>
  )
}