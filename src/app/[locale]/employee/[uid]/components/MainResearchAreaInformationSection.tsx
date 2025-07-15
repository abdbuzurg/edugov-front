"use client"

import Dialog from "@/components/Dialog"
import { EmployeeMainResearchArea } from "@/types/employee"
import { useFormik } from "formik"
import { FormEvent, Fragment, useState } from "react"
import { FaPen, FaPlus, FaPlusCircle, FaTrash } from "react-icons/fa"

interface Props {
  mainResearchArea: EmployeeMainResearchArea[]
}


export default function MainResearchAreaInformationSection({ mainResearchArea }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      mainResearchArea: [...mainResearchArea.map(v => ({ ...v, editMode: false }))]
    },
    onSubmit: _ => { }
  })

  const addNewMRA = () => {
    editModeFormData.setFieldValue("mainResearchArea", [{
      id: 0,
      area: "",
      discipline: "",
      keyTopics: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      editMode: true,
    }, ...editModeFormData.values.mainResearchArea])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deleteMRA = () => {
    const mra = editModeFormData.values.mainResearchArea.filter((_, i) => i != toBeDeletedIndex)
    editModeFormData.setFieldValue("mainResearchArea", mra)
    setIsDeleteDialogOpen(false)
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`mainResearchArea[${index}].editMode`, false)
  }

  const deleteKeyTopic = (mraIndex: number, ktIndex: number) => {
    const kts = editModeFormData.values.mainResearchArea[mraIndex].keyTopics!.filter((_, i) => i != ktIndex)
    editModeFormData.setFieldValue(`mainResearchArea[${mraIndex}].keyTopics`, kts)
  }

  const addKeyTopic = (mraIndex: number) => {
    let kt = editModeFormData.values.mainResearchArea[mraIndex].keyTopics
    if (!kt) {
      kt = []
    }

    editModeFormData.setFieldValue(`mainResearchArea[${mraIndex}].keyTopics`, [
      ...kt, {
        id: 0,
        keyTopicTitle: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = mainResearchArea.find(v => v.id == id)
    if (!findByID) {
      const mainResearchAreas = editModeFormData.values.mainResearchArea.filter((_, i) => i != index)
      editModeFormData.setFieldValue("mainResearchArea", mainResearchAreas)
      return
    }

    editModeFormData.setFieldValue(`mainResearchArea[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Основная область исследований</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewMRA()} />
        </div>
      </div>
      <div className="flex flex-col space-y-1 px-6">
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <h4 className="text-center font-semibold">Вы уверены что хотите удалить?</h4>
          <div className="flex space-x-2 items-center justify-center mt-2">
            <div
              className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
              onClick={() => deleteMRA()}
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
        {editModeFormData.values.mainResearchArea.map((mra, index) => (
          <Fragment key={index}>

            {!mra.editMode
              ?
              <div className="flex flex-col space-y-1  border-b-1 pb-2">

                <div className="flex justify-between items-center border-gray-500">
                  <p className="font-semibold text-xl">Область: {mra.area}</p>
                  <div className="flex space-x-2">
                    <FaPen
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`mainResearchArea[${index}].editMode`, true)}
                      className="cursor-pointer"
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
                <div>
                  <div className="flex space-x-2 items-center">
                    <h4 className="font-semibold text-lg">Дисциплина:</h4>
                    <div className="px-3 py-2 bg-gray-300 rounded-xl">{mra.discipline}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Ключевые Темы:</h4>
                    <div className="px-6">
                      <ol className="list-decimal">
                        {mra.keyTopics && mra.keyTopics.map((kt, i) => (
                          <li key={i}>{kt.keyTopicTitle}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              :

              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`mainResearchArea[${index}.area]`} className="font-semibold">Область</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`mainResearchArea[${index}].area`}
                    name={`mainResearchArea[${index}].area`}
                    value={editModeFormData.values.mainResearchArea[index].area}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`mainResearchArea[${index}.discipline]`} className="font-semibold">Дисциплина</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`mainResearchArea[${index}].discipline`}
                    name={`mainResearchArea[${index}].discipline`}
                    value={editModeFormData.values.mainResearchArea[index].discipline}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label>Ключевые темы</label>
                  <div className="flex flex-col space-y-2">
                    {mra.keyTopics && mra.keyTopics.map((kt, i) => (
                      <div className="flex space-x-4 items-center" key={i}>
                        <input
                          type="text"
                          className="border p-2 rounded-xl border-gray-400 bg-gray-300 w-full"
                          id={`mainResearchArea[${index}].keyTopics[${i}].keyTopicTitle`}
                          name={`mainResearchArea[${index}].keyTopics[${i}].keyTopicTitle`}
                          value={kt.keyTopicTitle}
                          onChange={editModeFormData.handleChange}
                        />
                        <div>
                          <FaTrash
                            color="red"
                            className="cursor-pointer"
                            onClick={() => deleteKeyTopic(index, i)}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center ">
                      <FaPlusCircle
                        color="blue"
                        size={32}
                        className="cursor-pointer"
                        onClick={() => addKeyTopic(index)}
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
                    onClick={() => onCancelClick(index, mra.id)}
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
