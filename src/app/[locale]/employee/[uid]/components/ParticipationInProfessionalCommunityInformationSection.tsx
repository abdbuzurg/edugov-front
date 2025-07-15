"use client"

import Dialog from "@/components/Dialog"
import { EmployeeParticipationInProfessionalCommunity } from "@/types/employee"
import { useFormik } from "formik"
import { FormEvent, Fragment, useState } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"

interface Props {
  participationInProfessionalCommunities: EmployeeParticipationInProfessionalCommunity[]
}

export default function ParticipationInProfessionalCommunityInformationSection({ participationInProfessionalCommunities }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      pipc: [...participationInProfessionalCommunities.map(v => ({ ...v, editMode: false }))]
    },
    onSubmit: _ => { },
  })

  const addNewPatent = () => {
    editModeFormData.setFieldValue("pipc", [
      {
        id: 0,
        professionalCommunityTitle: "",
        roleInProfessionalCommunity: "",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...editModeFormData.values.pipc,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deletePIPC = () => {
    const filteredPIPC = editModeFormData.values.pipc.filter((_, i) => i != toBeDeletedIndex)
    editModeFormData.setFieldValue("pipc", filteredPIPC)
    setIsDeleteDialogOpen(false)
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = participationInProfessionalCommunities.find(v => v.id == id)
    if (!findByID) {
      const filteredPIPC = editModeFormData.values.pipc.filter((_, i) => i != index)
      editModeFormData.setFieldValue(`pipc`, filteredPIPC)
      return
    }

    editModeFormData.setFieldValue(`pipc[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }


  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`pipc[${index}].editMode`, false)
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Участие в профессиональных сообществах</p>
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
              onClick={() => deletePIPC()}
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
        {editModeFormData.values.pipc.map((pipc, index) => (
          <Fragment key={index}>
            {!pipc.editMode
              ?
              <div className="flex flex-col space-y-1 border-b-1 py-2">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <h4 className="font-semibold text-l">Название:</h4>
                    <p>{pipc.professionalCommunityTitle}</p>
                  </div>
                  <div className="flex space-x-2">
                    <FaPen
                      className="cursor-pointer"
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`pipc[${index}].editMode`, true)}
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
                  <h4 className="font-semibold text-l">Роль:</h4>
                  <p>{pipc.roleInProfessionalCommunity}</p>
                </div>
              </div>

              :
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`pipc[${index}.professionalCommunityTitle]`} className="font-semibold">Название</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`pipc[${index}].professionalCommunityTitle`}
                    name={`pipc[${index}].professionalCommunityTitle`}
                    value={editModeFormData.values.pipc[index].professionalCommunityTitle}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`pipc[${index}.roleInProfessionalCommunity]`} className="font-semibold">Роль</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`pipc[${index}].roleInProfessionalCommunity`}
                    name={`pipc[${index}].roleInProfessionalCommunity`}
                    value={editModeFormData.values.pipc[index].roleInProfessionalCommunity}
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
                    onClick={() => onCancelClick(index, pipc.id)}
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
