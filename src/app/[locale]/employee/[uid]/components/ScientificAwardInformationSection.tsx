"use client"

import Dialog from "@/components/Dialog"
import { EmployeeScientificAward } from "@/types/employee"
import { useFormik } from "formik"
import { FormEvent, Fragment, useState } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"

interface Props {
  scientificAwards: EmployeeScientificAward[]
}

export default function ScientificAwardInformationSection({ scientificAwards }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      scientificAward: [...scientificAwards.map(v => ({ ...v, editMode: false }))]
    },
    onSubmit: _ => { }
  })

  const addNewScientificAward = () => {
    editModeFormData.setFieldValue("scientificAward", [
      {
        id: 0,
        scientificAwardTitle: "",
        givenBy: "",
        linkToScientificAwardFile: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...editModeFormData.values.scientificAward,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deleteScientificAward = () => {
    const filteredScientificAwards = editModeFormData.values.scientificAward.filter((_, i) => i != toBeDeletedIndex)
    editModeFormData.setFieldValue("scientificAward", filteredScientificAwards)
    setIsDeleteDialogOpen(false)
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = scientificAwards.find(v => v.id == id)
    if (!findByID) {
      const filteredScientificAwards = editModeFormData.values.scientificAward.filter((_, i) => i != index)
      editModeFormData.setFieldValue(`scientificAward`, filteredScientificAwards)
      return
    }

    editModeFormData.setFieldValue(`scientificAward[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`scientificAward[${index}].editMode`, false)
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Премии и награды</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewScientificAward()} />
        </div>
      </div>
      <div className="flex flex-col space-y-2 px-6">
        {editModeFormData.values.scientificAward.map((scientificAward, index) => (
          <Fragment key={index}>
            <Dialog
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
            >
              <h4 className="text-center font-semibold">Вы уверены что хотите удалить?</h4>
              <div className="flex space-x-2 items-center justify-center mt-2">
                <div
                  className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
                  onClick={() => deleteScientificAward()}
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
            {!scientificAward.editMode
              ?
              <div className="flex flex-col space-y-1 border-b-1 py-2">

                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <h4 className="font-semibold text-l">Название:</h4>
                    <p>{scientificAward.scientificAwardTitle}</p>
                  </div>
                  <div className="flex space-x-2">
                    <FaPen
                      className="cursor-pointer"
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`scientificAward[${index}].editMode`, true)}
                    />
                    <FaTrash
                      color="red"
                      onClick={() => {
                        setIsDeleteDialogOpen(true)
                        setToBeDeletedIndex(index)
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <h4 className="font-semibold text-l">Организация:</h4>
                  <p>{scientificAward.givenBy}</p>
                </div>
              </div>
              :
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`scientificAward[${index}.scientificAwardTitle]`} className="font-semibold">Название награды</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`scientificAward[${index}].scientificAwardTitle`}
                    name={`scientificAward[${index}].scientificAwardTitle`}
                    value={editModeFormData.values.scientificAward[index].scientificAwardTitle}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`scientificAward[${index}.givenBy]`} className="font-semibold">Организация</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`scientificAward[${index}].givenBy`}
                    name={`scientificAward[${index}].givenBy`}
                    value={editModeFormData.values.scientificAward[index].givenBy}
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
                    onClick={() => onCancelClick(index, scientificAward.id)}
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
