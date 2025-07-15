"use client"

import { EmployeeDetails } from "@/types/employee";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa";


type EmployeeCredentials = {
  name: string
  surname: string
  middlename: string
}

const extractLatestCredentials = (details: EmployeeDetails[]): EmployeeCredentials => {
  const latest = details.find(v => v.isEmployeeDetailsNew)
  if (!latest) {
    return {
      name: "",
      surname: "",
      middlename: "",
    }
  }
  return {
    name: latest.name,
    surname: latest.surname,
    middlename: latest.middlename,
  }
}

const extractOldCredentials = (details: EmployeeDetails[]): EmployeeCredentials[] => {
  return details.filter(v => !v.isEmployeeDetailsNew).map<EmployeeCredentials>(v => ({
    name: v.name,
    surname: v.surname,
    middlename: v.middlename,
  }))
}

interface Props {
  details: EmployeeDetails[]
}

function DetialsDisplay({ detials }: { detials: EmployeeDetails[] }) {
  
  const detialsQuery = useQuery<EmployeeDetails[], Error>({
    initialData: details,
  })

  return (
    <>
      <div className="w-full px-6">
        <div className="h-60 bg-gray-300 rounded-xl">
          image here
        </div>
      </div>
      <div className="flex flex-col items-center font-bold text-xl border-b-1 pb-2">
        <span>{editModeFormData.values.latestCredentials.surname}</span>
        <span>{editModeFormData.values.latestCredentials.name}</span>
        <span>{editModeFormData.values.latestCredentials.middlename}</span>
      </div>
      {editModeFormData.values.oldCredentials.length != 0 && editModeFormData.values.oldCredentials.map((v, index) => (
        <div className="flex flex-col items-center font-bold text-xl border-b-1 pb-2" key={index}>
          <span>{v.surname}</span>
          <span>{v.name}</span>
          <span>{v.middlename}</span>
        </div>
      ))}
    </>
  )
}

export default function EmployeeMainInformationSection({ details }: Props) {

  const [editMode, setEditMode] = useState<boolean>(false)
  const detialsQuery = useQuery({
    queryKey: ["employee-details"]
  })

  const editModeFormData = useFormik({
    initialValues: {
      latestCredentials: extractLatestCredentials(details),
      oldCredentials: [...extractOldCredentials(details)],
    },
    onSubmit: values => {
      setEditMode(false)
      console.log(values)
    }
  })

  const onDeleteOldCredentialClick = (index: number) => {
    const oldCredentials = editModeFormData.values.oldCredentials.filter((_, i) => i != index)
    editModeFormData.setFieldValue("oldCredentials", oldCredentials)
  }

  const onAddOldCredentialClick = () => {
    editModeFormData.setFieldValue("oldCredentials", [...editModeFormData.values.oldCredentials, {
      name: "",
      surname: "",
      middlename: "",
    }])
  }

  const onCancelClick = () => {
    editModeFormData.setFieldValue("latestCredentials", extractLatestCredentials(employee.details))
    editModeFormData.setFieldValue("oldCredentials", [...extractOldCredentials(employee.details)])
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
          <div className="flex flex-col items-center font-bold text-xl border-b-1 pb-2">
            <span>{editModeFormData.values.latestCredentials.surname}</span>
            <span>{editModeFormData.values.latestCredentials.name}</span>
            <span>{editModeFormData.values.latestCredentials.middlename}</span>
          </div>
          {editModeFormData.values.oldCredentials.length != 0 && editModeFormData.values.oldCredentials.map((v, index) => (
            <div className="flex flex-col items-center font-bold text-xl border-b-1 pb-2" key={index}>
              <span>{v.surname}</span>
              <span>{v.name}</span>
              <span>{v.middlename}</span>
            </div>
          ))}
        </>
        :
        <>
          <form className="flex flex-col space-y-3" onSubmit={editModeFormData.handleSubmit}>
            {/* CURRECT CREDENTIAL FORM */}
            <div className="border-b-1 py-2">
              <div className="w-full px-6">
                <div className="h-60 bg-gray-300 rounded-xl">
                  image here
                </div>
              </div>
              <h4 className="font-semibold text-l text-center">Укажите ваше текущее ФИО</h4>
              <div className="flex flex-col space-y-1 px-3">
                <label htmlFor="latestCredentials.surname" className="font-semibold">Фамилия</label>
                <input
                  className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                  name="latestCredentials.surname"
                  id="latestCredentials.surname"
                  type="text"
                  value={editModeFormData.values.latestCredentials.surname}
                  onChange={editModeFormData.handleChange}
                />
              </div>
              <div className="flex flex-col space-y-1 px-3">
                <label htmlFor="latestCredentials.name" className="font-semibold">Имя</label>
                <input
                  className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                  name="latestCredentials.name"
                  id="latestCredentials.name"
                  type="text"
                  value={editModeFormData.values.latestCredentials.name}
                  onChange={editModeFormData.handleChange}
                />
              </div>
              <div className="flex flex-col space-y-1 px-3">
                <label htmlFor="latestCredentials.middlename" className="font-semibold">Отчество</label>
                <input
                  className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                  name="latestCredentials.middlename"
                  id="latestCredentials.middlename"
                  type="text"
                  value={editModeFormData.values.latestCredentials.middlename}
                  onChange={editModeFormData.handleChange}
                />
              </div>
            </div>
            {/* OLD CREDENTIAL FORM */}
            <div className="border-b-1 py-2 px-3">
              <h4 className="font-semibold text-l text-center">Укажите старое ФИО (если меняли)</h4>
              {editModeFormData.values.oldCredentials.map((_, i) => (
                <div className="border-b-1 py-2" key={i}>
                  <div className="flex flex-col space-y-1 px-3">
                    <label htmlFor={`oldCredentials[${i}].surname`} className="font-semibold">Фамилия</label>
                    <input
                      className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                      name={`oldCredentials[${i}].surname`}
                      id={`oldCredentials[${i}].surname`}
                      type="text"
                      value={editModeFormData.values.oldCredentials[i].surname}
                      onChange={editModeFormData.handleChange}
                    />
                  </div>
                  <div className="flex flex-col space-y-1 px-3">
                    <label htmlFor={`oldCredentials[${i}].name`} className="font-semibold">Имя</label>
                    <input
                      className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                      name={`oldCredentials[${i}].name`}
                      id={`oldCredentials[${i}].name`}
                      type="text"
                      value={editModeFormData.values.oldCredentials[i].name}
                      onChange={editModeFormData.handleChange}
                    />
                  </div>
                  <div className="flex flex-col space-y-1 px-3">
                    <label htmlFor={`oldCredentials[${i}].middlename`} className="font-semibold">Отчество</label>
                    <input
                      className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                      name={`oldCredentials[${i}].middlename`}
                      id={`oldCredentials[${i}].middlename`}
                      type="text"
                      value={editModeFormData.values.oldCredentials[i].middlename}
                      onChange={editModeFormData.handleChange}
                    />
                  </div>
                  <div className="flex w-full items-center justify-center py-2">
                    <div
                      className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
                      onClick={() => onDeleteOldCredentialClick(i)}
                    >
                      Удалить
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex w-full items-center justify-center py-2">
                <div
                  className="py-2 px-4 bg-[#095088] hover:bg-[#0b64a8] text-white rounded cursor-pointer"
                  onClick={() => onAddOldCredentialClick()}
                >
                  Добавить
                </div>
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
