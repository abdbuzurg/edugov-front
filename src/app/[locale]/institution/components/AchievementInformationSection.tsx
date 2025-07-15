"use client"

import Dialog from "@/components/Dialog"
import { InstitutionAchievement } from "@/types/institution"
import formatDate from "@/utils/dateFormatter"
import { useFormik } from "formik"
import { ChangeEvent, FormEvent, Fragment, useState } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"

interface Props {
  achievements: InstitutionAchievement[]
}

export default function AchievementInformationSection({ achievements }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      achievement: [...achievements.map(v => ({ ...v, editMode: false }))]
    },
    onSubmit: _ => { }
  })

  const addNewAchievement = () => {
    editModeFormData.setFieldValue("achievement", [
      {
        id: 0,
        achievementTitle: "",
        dateReceived: new Date(),
        givenBy: "",
        description: "",
        linkToFile: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...editModeFormData.values.achievement,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deleteAchievement = () => {
    const filteredAchievement = editModeFormData.values.achievement.filter((_, i) => i != toBeDeletedIndex)
    editModeFormData.setFieldValue("achievement", filteredAchievement)
    setIsDeleteDialogOpen(false)
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = achievements.find(v => v.id == id)
    if (!findByID) {
      const workExperiences = editModeFormData.values.achievement.filter((_, i) => i != index)
      editModeFormData.setFieldValue("achievement", workExperiences)
      return
    }

    editModeFormData.setFieldValue(`achievement[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`achievement[${index}].editMode`, false)
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Достижения</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewAchievement()} />
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
              onClick={() => deleteAchievement()}
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
        {editModeFormData.values.achievement.map((achv, index) => (
          <Fragment key={index}>
            {!achv.editMode
              ?
              <div className="flex flex-col space-y-1 border-b-1 py-2">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <h4 className="font-semibold text-l">Название:</h4>
                    <p>{achv.achievementTitle}</p>
                  </div>
                  <div className="flex space-x-2">
                    <FaPen
                      className="cursor-pointer"
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`achievement[${index}].editMode`, true)}
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
                  <p>{achv.givenBy}</p>
                </div>
                <div className="flex space-x-2">
                  <h4 className="font-semibold text-l">Дата получения:</h4>
                  <p>{formatDate(achv.dateReceived)}</p>
                </div>
                <div className="flex space-x-2">
                  <h4 className="font-semibold text-l">Описание:</h4>
                  <p>{achv.description}</p>
                </div>
              </div>
              :
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`achievement[${index}].achievementTitle`} className="font-semibold">Название</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`achievement[${index}].achievementTitle`}
                    name={`achievement[${index}].achievementTitle`}
                    value={editModeFormData.values.achievement[index].achievementTitle}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`achievement[${index}].givenBy`} className="font-semibold">Выдано</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`achievement[${index}].givenBy`}
                    name={`achievement[${index}].givenBy`}
                    value={editModeFormData.values.achievement[index].givenBy}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`achievement[${index}].dateReceived`} className="font-semibold">Дата получения</label>
                  <input
                    type="date"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`achievement[${index}].dateReceived`}
                    name={`achievement[${index}].dateReceived`}
                    value={editModeFormData.values.achievement[index].dateReceived.toISOString().slice(0, 10)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => editModeFormData.setFieldValue(`achievement[${index}].dateReceived`, new Date(e.target.value))}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`achievement[${index}.description]`} className="font-semibold">Описание</label>
                  <textarea
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300 max-w-full min-h-[150px]"
                    id={`achievement[${index}].description`}
                    name={`achievement[${index}].description`}
                    value={editModeFormData.values.achievement[index].description}
                    onChange={editModeFormData.handleChange}
                  ></textarea>
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
                    onClick={() => onCancelClick(index, achv.id)}
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
