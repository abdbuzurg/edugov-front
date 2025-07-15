"use client"

import Dialog from "@/components/Dialog";
import { InstitutionLicense } from "@/types/institution";
import formatDate from "@/utils/dateFormatter";
import { useFormik } from "formik";
import { ChangeEvent, FormEvent, Fragment, useState } from "react";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";

interface Props {
  licences: InstitutionLicense[]
}

export default function LicenceInformationSection({ licences }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      licence: [...licences.map(v => ({ ...v, editMode: false }))]
    },
    onSubmit: _ => { },
  })

  const addNewLicence = () => {
    editModeFormData.setFieldValue("licence", [
      {
        id: 0,
        licenceTitle: "",
        givenBy: "",
        linkToFole: "",
        dateStart: new Date(),
        dateEnd: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...editModeFormData.values.licence,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deleteLicence = () => {
    const filteredLicence = editModeFormData.values.licence.filter((_, i) => i != toBeDeletedIndex)
    editModeFormData.setFieldValue("licence", filteredLicence)
    setIsDeleteDialogOpen(false)
  }

  const onDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    editModeFormData.setFieldValue(e.target.name, new Date(e.target.value))
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = licences.find(v => v.id == id)
    if (!findByID) {
      const workExperiences = editModeFormData.values.licence.filter((_, i) => i != index)
      editModeFormData.setFieldValue("licence", workExperiences)
      return
    }

    editModeFormData.setFieldValue(`licence[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`licence[${index}].editMode`, false)
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Лицензии</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewLicence()} />
        </div>
      </div>
      <div className="flex flex-col space-y-2 px-6">
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <h4 className="text-center font-semibold">Вы уверены что хотите удалить?</h4>
          <div className="flex space-x-2 items-center justify-center mt-2">
            <div
              className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
              onClick={() => deleteLicence()}
            >
              Удалить
            </div>
            <div
              className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Отмена
            </div>
          </div>
        </Dialog>
        {editModeFormData.values.licence.map((licence, index) => (
          <Fragment key={index}>
            {!licence.editMode
              ?
              <div className="flex flex-col space-y-1 border-b-1 py-2">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <h4 className="font-semibold text-l">Название:</h4>
                    <p>{licence.licenceTitle}</p>
                  </div>
                  <div className="flex space-x-2">
                    <FaPen
                      className="cursor-pointer"
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`licence[${index}].editMode`, true)}
                    />
                    <FaTrash
                      color="red"
                      onClick={() => {
                        setToBeDeletedIndex(index)
                        setIsDeleteDialogOpen(true)
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <h4 className="font-semibold text-l">Выдано:</h4>
                  <p>{licence.givenBy}</p>
                </div>
                <div className="flex space-x-2">
                  <h4 className="font-semibold text-l">Валидный период:</h4>
                  <p>{formatDate(licence.dateStart)} - {formatDate(licence.dateEnd)}</p>
                </div>
              </div>
              :
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`licence[${index}].licenceTitle`} className="font-semibold">Название</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`licence[${index}].licenceTitle`}
                    name={`licence[${index}].licenceTitle`}
                    value={editModeFormData.values.licence[index].licenceTitle}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`licence[${index}].givenBy`} className="font-semibold">Выдано</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`licence[${index}].givenBy`}
                    name={`licence[${index}].givenBy`}
                    value={editModeFormData.values.licence[index].givenBy}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-semibold">Период</label>
                  <div className="flex space-x-2">
                    <div className="flex flex-col space-y-1">
                      <label>Начало</label>
                      <input
                        type="date"
                        className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                        id={`licence[${index}].dateStart`}
                        name={`licence[${index}].dateStart`}
                        value={editModeFormData.values.licence[index].dateStart.toISOString().slice(0, 10)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label>Конец</label>
                      <input
                        type="date"
                        className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                        id={`licence[${index}].dateEnd`}
                        name={`licence[${index}].dateEnd`}
                        value={editModeFormData.values.licence[index].dateEnd.toISOString().slice(0, 10)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 items-center justify-start">
                  <button
                    type="submit"
                    className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded cursor-pointer"
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
                    onClick={() => onCancelClick(index, licence.id)}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            }
          </Fragment>
        ))}
      </div>
    </div>
  )
}
