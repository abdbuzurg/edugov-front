"use client"

import Dialog from "@/components/Dialog"
import { EmployeeRefrehserCourse } from "@/types/employee"
import formatDate from "@/utils/dateFormatter"
import { useFormik } from "formik"
import { ChangeEvent, FormEvent, Fragment, useState } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"

interface Props {
  refresherCourses: EmployeeRefrehserCourse[]
}

export default function RefresherCourseInformationSection({ refresherCourses }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      refresherCourse: [...refresherCourses.map(v => ({ ...v, editMode: false }))]
    },
    onSubmit: _ => {},
  })

  const addNewRefresherCourse = () => {
    editModeFormData.setFieldValue("refresherCourse", [
      {
        id: 0,
        courseTitle: "",
        dateStart: new Date(),
        dateEnd: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...editModeFormData.values.refresherCourse,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deleteRefresherCourse = () => {
    const filteredRefresherCourse = editModeFormData.values.refresherCourse.filter((_, i) => i != toBeDeletedIndex)
    editModeFormData.setFieldValue("refresherCourse", filteredRefresherCourse)
    setIsDeleteDialogOpen(false)
  }

  const onDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    editModeFormData.setFieldValue(e.target.name, new Date(e.target.value))
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = refresherCourses.find(v => v.id == id)
    if (!findByID) {
      const filteredRefresherCourse = editModeFormData.values.refresherCourse.filter((_, i) => i != index)
      editModeFormData.setFieldValue(`refresherCourse`, filteredRefresherCourse)
      return
    }

    editModeFormData.setFieldValue(`refresherCourse[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`refresherCourse[${index}].editMode`, false)
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Курсы повышения квалификации и дополнительное образование</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewRefresherCourse()} />
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
              onClick={() => deleteRefresherCourse()}
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
        {editModeFormData.values.refresherCourse.map((course, index) => (
          <Fragment key={index}>
            {!course.editMode
              ?
              <div className="flex flex-col space-y-1 border-b-1 py-2">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <h4 className="font-semibold text-l">Название:</h4>
                    <p>{course.courseTitle}</p>
                  </div>
                  <div className="flex space-x-2">
                    <FaPen
                      className="cursor-pointer"
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`refresherCourse[${index}].editMode`, true)}
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
                  <h4 className="font-semibold text-l">Даты проведения:</h4>
                  <p>{formatDate(course.dateStart)} - {formatDate(course.dateEnd)}</p>
                </div>
              </div>

              :

              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`refresherCourse[${index}.courseTitle]`} className="font-semibold">Название</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`refresherCourse[${index}].courseTitle`}
                    name={`refresherCourse[${index}].courseTitle`}
                    value={editModeFormData.values.refresherCourse[index].courseTitle}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-semibold">Дата проведения</label>
                  <div className="flex space-x-2">
                    <div className="flex flex-col space-y-1">
                      <label>Начало</label>
                      <input
                        type="date"
                        className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                        id={`refresherCourse[${index}].dateStart`}
                        name={`refresherCourse[${index}].dateStart`}
                        value={editModeFormData.values.refresherCourse[index].dateStart.toISOString().slice(0, 10)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label>Конец</label>
                      <input
                        type="date"
                        className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                        id={`refresherCourse[${index}].dateEnd`}
                        name={`refresherCourse[${index}].dateEnd`}
                        value={editModeFormData.values.refresherCourse[index].dateEnd.toISOString().slice(0, 10)}
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
                    onClick={() => onCancelClick(index, course.id)}
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
