"use client"

import Dialog from "@/components/Dialog"
import { EmployeePublication } from "@/types/employee"
import { useFormik } from "formik"
import { FormEvent, Fragment, useState } from "react"
import { FaExternalLinkAlt, FaPen, FaPlus, FaTrash } from "react-icons/fa"

interface Props {
  publications: EmployeePublication[]
}

export default function PublicationInformationSection({ publications }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      publication: [...publications.map(v => ({ ...v, editMode: false }))]
    },
    onSubmit: _ => { }
  })

  const addNewPublication = () => {
    editModeFormData.setFieldValue("publication", [
      {
        id: 0,
        publicationTitle: "",
        linkToPublication: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...editModeFormData.values.publication,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deletePublication = () => {
    const filteredPublications = editModeFormData.values.publication.filter((_, i) => i != toBeDeletedIndex)
    editModeFormData.setFieldValue("publication", filteredPublications)
    setIsDeleteDialogOpen(false)
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = publications.find(v => v.id == id)
    if (!findByID) {
      const filteredPublication = editModeFormData.values.publication.filter((_, i) => i != index)
      editModeFormData.setFieldValue(`publication`, filteredPublication)
      return
    }

    editModeFormData.setFieldValue(`publication[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`publication[${index}].editMode`, false)
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Публикации</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewPublication()} />
        </div>
      </div>
      <div className="flex flex-col space-y-1 border-b-1 pb-2 px-6">
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <h4 className="text-center font-semibold">Вы уверены что хотите удалить?</h4>
          <div className="flex space-x-2 items-center justify-center mt-2">
            <div
              className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
              onClick={() => deletePublication()}
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
        {editModeFormData.values.publication.map((publication, index) => (
          <Fragment key={index}>
            {!publication.editMode
              ?
              <div className="flex justify-between items-center border-gray-500 space-x-2">
                <div className="flex space-x-1 items-center">
                  <p className="font-bold text-l">
                    {publication.publicationTitle}
                    <a
                      className="inline-block ml-1"
                      href={publication.linkToPublication}
                      target="_blank"
                    >
                      <FaExternalLinkAlt color="blue" />
                    </a>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <FaPen
                    className="cursor-pointer"
                    color="blue"
                    onClick={() => editModeFormData.setFieldValue(`publication[${index}].editMode`, true)}
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

              :

              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`publication[${index}.publicationTitle]`} className="font-semibold">Название публикации</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`publication[${index}].publicationTitle`}
                    name={`publication[${index}].publicationTitle`}
                    value={editModeFormData.values.publication[index].publicationTitle}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`publication[${index}.linkToPublication]`} className="font-semibold">Ссылка на публикацию</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`publication[${index}].linkToPublication`}
                    name={`publication[${index}].linkToPublication`}
                    value={editModeFormData.values.publication[index].linkToPublication}
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
                    onClick={() => onCancelClick(index, publication.id)}
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

