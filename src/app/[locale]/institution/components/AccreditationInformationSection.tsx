"use client"

import Dialog from "@/components/Dialog"
import { InstitutionAccreditation } from "@/types/institution"
import { useFormik } from "formik"
import { FormEvent, Fragment, useState } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"

interface Props {
  accreditations: InstitutionAccreditation[]
}

export default function AccreditationInformationSection({ accreditations }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      accreditation: [...accreditations.map(v => ({ ...v, editMode: false }))],
    },
    onSubmit: _ => { },
  })

  const addNewAccreditation = () => {
    editModeFormData.setFieldValue("accreditation", [
      {
        id: 0,
        accreditationType: "",
        givenBy: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true
      },
      ...editModeFormData.values.accreditation
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deleteAccreditation = () => {
    const filteredAccreditation = editModeFormData.values.accreditation.filter((_, i) => i != toBeDeletedIndex)
    editModeFormData.setFieldValue("accreditation", filteredAccreditation)
    setIsDeleteDialogOpen(false)
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = accreditations.find(v => v.id == id)
    if (!findByID) {
      const filteredPatent = editModeFormData.values.accreditation.filter((_, i) => i != index)
      editModeFormData.setFieldValue(`accreditation`, filteredPatent)
      return
    }

    editModeFormData.setFieldValue(`accreditation[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`accreditation[${index}].editMode`, false)
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Аккредитация</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewAccreditation()} />
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
              onClick={() => deleteAccreditation()}
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
        {editModeFormData.values.accreditation.map((accred, index) => (
          <Fragment key={index}>
            {!accred.editMode
              ?
              <div className="flex flex-col space-y-1 border-b-1 py-2">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <h4 className="font-semibold text-l">Название:</h4>
                    <p>{accred.accreditationType}</p>
                  </div>
                  <div className="flex space-x-2">
                    <FaPen
                      className="cursor-pointer"
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`accreditation[${index}].editMode`, true)}
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
                  <p>{accred.givenBy}</p>
                </div>
              </div>
              :
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`accreditation[${index}].accreditationType`} className="font-semibold">Название</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`accreditation[${index}].accreditationType`}
                    name={`accreditation[${index}].accreditationType`}
                    value={editModeFormData.values.accreditation[index].accreditationType}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`accreditation[${index}].givenBy`} className="font-semibold">Описание</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`accreditation[${index}].givenBy`}
                    name={`accreditation[${index}].givenBy`}
                    value={editModeFormData.values.accreditation[index].givenBy}
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
                    onClick={() => onCancelClick(index, accred.id)}
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
