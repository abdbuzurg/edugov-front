"use client"

import Dialog from "@/components/Dialog";
import { EmployeeWorkExperience } from "@/types/employee";
import formatDate from "@/utils/dateFormatter";
import { useFormik } from "formik";
import { ChangeEvent, FormEvent, Fragment, useState } from "react";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";

interface Props {
  workExperience: EmployeeWorkExperience[]
}

export default function WorkExperienceInformationSection({ workExperience }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      workExperience: workExperience.map(v => ({ ...v, editMode: false })),
    },
    onSubmit: _ => { }
  })

  const addNewWorkExperience = () => {
    editModeFormData.setFieldValue("workExperience", [{
      id: 0,
      workplace: "",
      jobTitle: "",
      description: "",
      dateStart: new Date(),
      dateEnd: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      editMode: true
    }, ...editModeFormData.values.workExperience])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const deleteWorkExperience = (index: number) => {
    const workExperiences = editModeFormData.values.workExperience.filter((_, i) => i != index)
    editModeFormData.setFieldValue("workExperience", workExperiences)
    setIsDeleteDialogOpen(false)
  }

  const onDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    editModeFormData.setFieldValue(e.target.name, new Date(e.target.value))
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = workExperience.find(v => v.id == id)
    if (!findByID) {
      const workExperiences = editModeFormData.values.workExperience.filter((_, i) => i != index)
      editModeFormData.setFieldValue("workExperience", workExperiences)
      return
    }

    editModeFormData.setFieldValue(`workExperience[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`workExperience[${index}].editMode`, false)
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Опыт работы</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewWorkExperience()} />
        </div>
      </div>
      <div className="flex flex-col space-y-1 px-6">
        {editModeFormData.values.workExperience.map((experience, index) => (
          <Fragment key={index}>
            {!experience.editMode
              ?
              <div className="flex flex-col space-y-1  border-b-1 pb-2" key={index}>
                <Dialog
                  isOpen={isDeleteDialogOpen}
                  onClose={() => setIsDeleteDialogOpen(false)}
                >
                  <h4 className="text-center font-semibold">Вы уверены что хотите удалить?</h4>
                  <div className="flex space-x-2 items-center justify-center mt-2">
                    <div
                      className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
                      onClick={() => deleteWorkExperience(index)}
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
                <div className="flex justify-between items-center border-gray-500">
                  <p className="font-semibold text-xl">{experience.workplace}</p>
                  <div className="flex space-x-2">
                    <FaPen
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`workExperience[${index}].editMode`, true)}
                      className="cursor-pointer"
                    />
                    <FaTrash
                      color="red"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <h5>Full Stack Software Developer</h5>
                  <div className="flex space-x-2">
                    <h4>{formatDate(experience.dateStart)} - {formatDate(experience.dateEnd)}</h4>
                  </div>
                  <p>{experience.description}</p>
                </div>
              </div>
              :
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`workExperience[${index}.workplace]`} className="font-semibold">Компания или организация</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`workExperience[${index}].workplace`}
                    name={`workExperience[${index}].workplace`}
                    value={editModeFormData.values.workExperience[index].workplace}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`workExperience[${index}.workplace]`} className="font-semibold">Должность</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`workExperience[${index}].jobTitle`}
                    name={`workExperience[${index}].jobTitle`}
                    value={editModeFormData.values.workExperience[index].jobTitle}
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
                        id={`workExperience[${index}].dateStart`}
                        name={`workExperience[${index}].dateStart`}
                        value={editModeFormData.values.workExperience[index].dateStart.toISOString().slice(0, 10)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label>Конец</label>
                      <input
                        type="date"
                        className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                        id={`workExperience[${index}].dateEnd`}
                        name={`workExperience[${index}].dateEnd`}
                        value={editModeFormData.values.workExperience[index].dateEnd.toISOString().slice(0, 10)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`workExperience[${index}.description]`} className="font-semibold">Краткое описание должности</label>
                  <textarea
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300 max-w-full min-h-[150px]"
                    id={`workExperience[${index}].description`}
                    name={`workExperience[${index}].description`}
                    value={editModeFormData.values.workExperience[index].description}
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
                    onClick={() => onCancelClick(index, experience.id)}
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
