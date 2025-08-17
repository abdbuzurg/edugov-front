import Dialog from "@/components/Dialog";
import { PersonnelFilter } from "@/types/personnel";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filterData: PersonnelFilter
  setFilterData: Dispatch<SetStateAction<PersonnelFilter>>
}

export default function PersonnelFilterDialog({
  isOpen,
  onClose,
  filterData,
  setFilterData,
}: Props) {
  const t = useTranslations("Personnel")

  const form = useFormik({
    initialValues: {
      ...filterData,
    },
    onSubmit: (values) => {
      setFilterData(values)
      onClose()
    }
  })

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
    >
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
          <p className="italic text-gray-500 text-sm">{t("nsidInformationText")}</p>
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
        </div>
        <hr />
        <div className="grid grid-cols-4 gap-y-3 gap-x-10 items-center">
          <label htmlFor="highestAcademicDegree" className="font-bold">{t("academicTitleText")}</label>
          <input
            type="text"
            className="col-span-3 border p-2 rounded-xl border-gray-400 bg-gray-100"
            name="highestAcademicDegree"
            id="highestAcademicDegree"
            value={form.values.highestAcademicDegree}
            onChange={form.handleChange}
          />

          <label htmlFor="speciality" className="font-bold">{t("scientificSpecialityText")}</label>
          <input
            type="text"
            className="col-span-3 border p-2 rounded-xl border-gray-400 bg-gray-100"
            name="speciality"
            id="speciality"
            value={form.values.speciality}
            onChange={form.handleChange}
          />

          <label htmlFor="workExperience" className="font-bold">{t("workExperienceText")}</label>
          <input
            type="nubmer"
            className="col-span-3 border p-2 rounded-xl border-gray-400 bg-gray-100"
            name="workExperience"
            id="workExperience"
            value={form.values.workExperience}
            onChange={form.handleChange}
          />
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
            onClick={() => form.resetForm()}
          >{t("clearButtonText")}</button>
          <button
            type="button"
            className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
            onClick={onClose}
          >{t("cancelButtonText")}</button>
        </div>
      </form>
    </Dialog>
  )
}
