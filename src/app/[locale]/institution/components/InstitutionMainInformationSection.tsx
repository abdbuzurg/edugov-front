"use client"

import { Institution } from "@/types/institution"
import { useFormik } from "formik"
import { useState } from "react"
import { FaPen } from "react-icons/fa"

interface Props {
  institution: Institution
}

export default function InstitutionMainInformationSection({ institution }: Props) {

  const [editMode, setEditMode] = useState(false)
  const editModeFormData = useFormik({
    initialValues: {
      commonInfo: {
        id: institution.id,
        yearOfEstablishment: institution.yearOfEstablishment,
        email: institution.email,
        fax: institution.fax,
      },
      details: institution.details,
    },
    onSubmit: _ => { 
      setEditMode(false)
    }
  })

  const onCancelClick = () => {
    editModeFormData.setFieldValue("commonInfo", {
      id: institution.id,
      yearOfEstablishment: institution.yearOfEstablishment,
      email: institution.email,
      fax: institution.fax,
    })
    editModeFormData.setFieldValue("details", institution.details)
    setEditMode(false)
  }

  return (
    <div className="self-start flex flex-col space-y-2 w-80 py-4 bg-gray-100 rounded-xl">
      <div className="flex justify-between items-center border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Основная информация</p>
        <div className="cursor-pointer">
          {!editMode && <FaPen color="blue" onClick={() => setEditMode(true)} />}
        </div>
      </div>
      {!editMode ?
        <>
          <div className="w-full px-6">
            <div className="h-60 bg-gray-300 rounded-xl">
              image here
            </div>
          </div>
          <div className="flex flex-col items-center font-bold text-xl border-b-1 pb-2 text-center">
            <span>{editModeFormData.values.details.institutionTitle}</span>
            <span>{editModeFormData.values.details.institutionAbbreviation}</span>
            <span>{editModeFormData.values.commonInfo.yearOfEstablishment}</span>
          </div>
          <div className="flex flex-col items-center font-bold border-b-1 pb-2">
            <span>{editModeFormData.values.commonInfo.email}</span>
            <span>{editModeFormData.values.commonInfo.fax}</span>
          </div>
        </>
        :
        <>
          <form className="flex flex-col space-y-3" onSubmit={editModeFormData.handleSubmit}>
            {/* FIRST SECTION */}
            <div className="border-b-1 py-2">
              <div className="w-full px-6">
                <div className="h-60 bg-gray-300 rounded-xl">
                  image here
                </div>
              </div>
              <div className="flex flex-col space-y-1 px-3">
                <label htmlFor="details.institutionTitle" className="font-semibold">Название института</label>
                <input
                  className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                  name="details.institutionTitle"
                  id="details.institutionTitle"
                  type="text"
                  value={editModeFormData.values.details.institutionTitle}
                  onChange={editModeFormData.handleChange}
                />
              </div>
              <div className="flex flex-col space-y-1 px-3">
                <label htmlFor="details.institutionAbbreviation" className="font-semibold">Абревиатура</label>
                <input
                  className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                  name="details.institutionAbbreviation"
                  id="details.institutionAbbreviation"
                  type="text"
                  value={editModeFormData.values.details.institutionAbbreviation}
                  onChange={editModeFormData.handleChange}
                />
              </div>
              <div className="flex flex-col space-y-1 px-3">
                <label htmlFor="commonInfo.yearOfEstablishment" className="font-semibold">Год основания</label>
                <input
                  className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                  name="commonInfo.yearOfEstablishment"
                  id="commonInfo.yearOfEstablishment"
                  type="text"
                  value={editModeFormData.values.commonInfo.yearOfEstablishment}
                  onChange={editModeFormData.handleChange}
                />
              </div>
            </div>
            {/* CONTACT DATA FORM */}
            <div className="border-b-1 pb-2">
              <div className="flex flex-col space-y-1 px-3">
                <label htmlFor="commonInfo.email" className="font-semibold">Электронная почта</label>
                <input
                  className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                  name="commonInfo.email"
                  id="commonInfo.email"
                  type="text"
                  value={editModeFormData.values.commonInfo.email}
                  onChange={editModeFormData.handleChange}
                />
              </div>
              <div className="flex flex-col space-y-1 px-3">
                <label htmlFor="commonInfo.fax" className="font-semibold">Факс/Мобильный номер</label>
                <input
                  className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                  name="commonInfo.fax"
                  id="commonInfo.fax"
                  type="text"
                  value={editModeFormData.values.commonInfo.fax}
                  onChange={editModeFormData.handleChange}
                />
              </div>
            </div>
            <div className="flex space-x-2 items-center justify-center">
              <button
                type="submit"
                className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded cursor-pointer"
              >
                Сохранить
              </button>
              <button
                type="button"
                className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
                onClick={() => onCancelClick()}
              >
                Отмена
              </button>
            </div>
          </form>
        </>
      }
    </div>
  )
}
