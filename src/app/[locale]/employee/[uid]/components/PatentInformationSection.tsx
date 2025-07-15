"use client"

import Dialog from "@/components/Dialog"
import { EmployeePatent } from "@/types/employee"
import { useFormik } from "formik"
import { FormEvent, Fragment, useState } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"

interface Props {
  patents: EmployeePatent[]
}

export default function PatentInformationSection({ patents }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      patent: [...patents.map(v => ({ ...v, editMode: false }))]
    },
    onSubmit: _ => { },
  })

  const addNewPatent = () => {
    editModeFormData.setFieldValue("patent", [
      {
        id: 0,
        patentTitle: "",
        description: "",
        linkToPatentFile: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...editModeFormData.values.patent,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deletePatent = () => {
    const filteredPublications = editModeFormData.values.patent.filter((_, i) => i != toBeDeletedIndex)
    editModeFormData.setFieldValue("patent", filteredPublications)
    setIsDeleteDialogOpen(false)
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = patents.find(v => v.id == id)
    if (!findByID) {
      const filteredPatent = editModeFormData.values.patent.filter((_, i) => i != index)
      editModeFormData.setFieldValue(`patent`, filteredPatent)
      return
    }

    editModeFormData.setFieldValue(`patent[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`patent[${index}].editMode`, false)
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Патент</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewPatent()} />
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
              onClick={() => deletePatent()}
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
        {editModeFormData.values.patent.map((patent, index) => (
          <Fragment key={index}>
            {!patent.editMode
              ?
              <div className="flex flex-col space-y-1 border-b-1 py-2">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <h4 className="font-semibold text-l">Название:</h4>
                    <p>{patent.patentTitle}</p>
                  </div>
                  <div className="flex space-x-2">
                    <FaPen
                      className="cursor-pointer"
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`patent[${index}].editMode`, true)}
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
                  <h4 className="font-semibold text-l">Описание:</h4>
                  <p>{patent.description}</p>
                </div>
              </div>
              :
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`patent[${index}.patentTitle]`} className="font-semibold">Название</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`patent[${index}].patentTitle`}
                    name={`patent[${index}].patentTitle`}
                    value={editModeFormData.values.patent[index].patentTitle}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`patent[${index}.description]`} className="font-semibold">Описание</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`patent[${index}].description`}
                    name={`patent[${index}].description`}
                    value={editModeFormData.values.patent[index].description}
                    onChange={editModeFormData.handleChange}
                  />
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
                    onClick={() => onCancelClick(index, patent.id)}
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
