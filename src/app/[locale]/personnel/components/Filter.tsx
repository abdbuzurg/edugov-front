import { personnelApi } from "@/api/personnel";
import { PersonnelFilter } from "@/types/personnel";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  setFilterDisplayState: Dispatch<SetStateAction<boolean>>
  filterData: PersonnelFilter
  setFilterData: Dispatch<SetStateAction<PersonnelFilter>>
  setPage: Dispatch<SetStateAction<number>>
}

export default function PersonnelFilterDialog({
  setFilterDisplayState,
  filterData,
  setFilterData,
  setPage,
}: Props) {
  const t = useTranslations("Personnel")

  const form = useFormik({
    initialValues: {
      ...filterData,
    },
    onSubmit: (values) => {
      setPage(1)
      setFilterData(values)
      setFilterDisplayState(false)
    }
  })

  const [allUniqueWorkplaces, setAllUniqueWorkeplaces] = useState<string[]>([])
  const workplacesQuery = useQuery<string[], Error, string[]>({
    queryKey: ["personnel-workplaces"],
    queryFn: () => personnelApi.listUniqueOngoingWorkplaces()
  })
  useEffect(() => {
    if (workplacesQuery.data && workplacesQuery.isSuccess) {
      setAllUniqueWorkeplaces(workplacesQuery.data)
    }
  }, [workplacesQuery.data])

  return (
    <form
      className="flex flex-col gap-y-3"
      onSubmit={form.handleSubmit}
    >
      <p className="font-bold text-xl">{t("filterTitleText")}</p>
      <div className="flex flex-col gap-y-1">
        <label htmlFor="uid" className="font-bold">NSID</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-100"
          name="uid"
          id="uid"
          value={form.values.uid}
          onChange={form.handleChange}
        />
      </div>
      <hr />
      <div className="grid grid-cols-4 gap-y-3 gap-x-5 items-center">
        <label htmlFor="name" className="font-semibold">{t("nameLabelText")}</label>
        <input
          type="text"
          className="col-span-3 border p-2 rounded-xl border-gray-400 bg-gray-100"
          name="name"
          id="name"
          value={form.values.name}
          onChange={form.handleChange}
        />

        <label htmlFor="surname" className="font-bold">{t("surnameLabelText")}</label>
        <input
          type="text"
          className="col-span-3 border p-2 rounded-xl border-gray-400 bg-gray-100"
          name="surname"
          id="surname"
          value={form.values.surname}
          onChange={form.handleChange}
        />

        <label htmlFor="middlename" className="font-bold">{t("middlenameLabelText")}</label>
        <input
          type="text"
          className="col-span-3 border p-2 rounded-xl border-gray-400 bg-gray-100"
          name="middlename"
          id="middlename"
          value={form.values.middlename}
          onChange={form.handleChange}
        />

        <label htmlFor="workplace" className="font-bold">
          {t("workplaceLabelText")}
        </label>
        <select
          className="col-span-3 border p-2 rounded-xl border-gray-400 bg-gray-100"
          name="workplace"
          id="workplace"
          value={(form.values as any).workplace ?? ""}
          onChange={form.handleChange}
        >
          <option value=""></option>
          {allUniqueWorkplaces.map((wp) => (
            <option key={wp} value={wp}>
              {wp}
            </option>
          ))}
        </select>
      </div>
      <hr />
      <div className="flex gap-x-2">
        <div className="flex-1 flex flex-col gap-y-1">
          <label htmlFor="workExperience">{t("numberOfCardsPerPaginationLabelText")}</label>
          <input
            type="nubmer"
            className="col-span-3 border p-2 rounded-xl border-gray-400 bg-gray-100"
            name="limit"
            id="limit"
            value={form.values.limit}
            onChange={form.handleChange}
          />
        </div>
        <div className="flex-1"></div>
      </div>
      <hr />
      <div className="flex space-x-2 items-center justify-center">
        <button
          type="submit"
          className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded cursor-pointer"
        >{t("confirmButtonText")}</button>
        <button
          type="button"
          className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
          onClick={() => {
            form.resetForm()
            form.setFieldValue("workplace", "")
            setFilterData(form.values)
            setPage(1)
          }}
        >{t("clearButtonText")}</button>
        <button
          type="button"
          className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
          onClick={() => setFilterDisplayState(false)}
        >{t("cancelButtonText")}</button>
      </div>
    </form >
  )
}
