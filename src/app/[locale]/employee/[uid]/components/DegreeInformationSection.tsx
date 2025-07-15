"use client"

import Dialog from "@/components/Dialog";
import { EmployeeDegree } from "@/types/employee";
import formatDate from "@/utils/dateFormatter";
import { useFormik } from "formik";
import { ChangeEvent, FormEvent, Fragment, useState } from "react";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";

interface Props {
  degree: EmployeeDegree[]
}

export default function DegreeInformationSection({ degree }: Props) {

  const editModeFormData = useFormik({
    initialValues: {
      degree: [...degree.map(v => ({
        id: v.id,
        degreeLevel: v.degreeLevel,
        recievedFrom: v.recievedFrom,
        speciality: v.speciality,
        dateStart: new Date(v.dateStart),
        dateEnd: new Date(v.dateEnd),
        givenBy: v.givenBy,
        dateDegreeRecieved: new Date(v.dateDegreeRecieved),
        linkToDegreeFile: v.linkToDegreeFile,
        editMode: false,
      }))],
    },
    onSubmit: _ => { }
  })

  const addNewDegree = () => {
    editModeFormData.setFieldValue("degree", [{
      id: 0,
      degreeLevel: "",
      recievedFrom: "",
      speciality: "",
      dateStart: new Date(),
      dateEnd: new Date(),
      givenBy: "",
      dateDegreeRecieved: new Date(),
      linkToDegreeFile: "",
      editMode: true,
    }, ...editModeFormData.values.degree])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deleteDegree = () => {
    const degree = editModeFormData.values.degree.filter((_, i) => i != toBeDeletedIndex)
    editModeFormData.setFieldValue("degree", degree)
    setIsDeleteDialogOpen(false)
  }

  const onDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    editModeFormData.setFieldValue(e.target.name, new Date(e.target.value))
  }

  const highDigreeLevelCheck = (degreeLevel: string): boolean => {
    return degreeLevel == "Кандидат Наук" || degreeLevel == "PhD" || degreeLevel == "Доктор Наук"
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = degree.find(v => v.id == id)
    if (!findByID) {
      const degrees = editModeFormData.values.degree.filter((_, i) => i != index)
      editModeFormData.setFieldValue("degree", degrees)
      return
    }

    editModeFormData.setFieldValue(`degree[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  const onFormSubmit = (e: FormEvent<HTMLFormElement>, index: number) => {
    e.preventDefault()
    editModeFormData.setFieldValue(`degree[${index}].editMode`, false)
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Образование</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewDegree()} />
        </div>
      </div>
      <div className="flex flex-col space-y-1 px-6">
        {editModeFormData.values.degree.map((degree, index) => (
          <Fragment key={index}>
            <Dialog
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
            >
              <h4 className="text-center font-semibold">Вы уверены что хотите удалить?</h4>
              <div className="flex space-x-2 items-center justify-center mt-2">
                <div
                  className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
                  onClick={() => deleteDegree()}
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
            {!degree.editMode
              ?
              <div className="flex flex-col space-y-1  border-b-1 pb-2">

                <div className="flex justify-between items-center border-gray-500">
                  <p className="font-semibold text-xl">{degree.recievedFrom}</p>
                  <div className="flex space-x-2">
                    <FaPen
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`degree[${index}].editMode`, true)}
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
                  <div className="flex space-x-2">
                    <h5>{degree.speciality}</h5>
                    <div className="border-l-1"></div>
                    <h4>{degree.degreeLevel}</h4>
                  </div>
                  <div>
                    <div className="flex space-x-2">
                      <h4>{formatDate(degree.dateStart)} - {formatDate(degree.dateEnd)}</h4>
                      <div className="border-l-1"></div>
                      <h4>Naryn, Kyrgyzstan</h4>
                    </div>
                  </div>
                </div>
              </div>

              :

              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`degree[${index}.recievedFrom]`} className="font-semibold">Университет</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`degree[${index}].recievedFrom`}
                    name={`degree[${index}].recievedFrom`}
                    value={editModeFormData.values.degree[index].recievedFrom}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-semibold">Степень</label>
                  <div className="flex space-x-2">
                    <div className="flex space-x-1 items-center">
                      <input
                        type="radio"
                        name={`degree[${index}].degreeLevel`}
                        id={`degree[${index}].degreeLevel-${degree.id}-bachelor`}
                        value="Бакалавр"
                        onChange={editModeFormData.handleChange}
                      />
                      <label htmlFor={`degree[${index}].degreeLevel-${degree.id}-bachelor`}>Бакалавр</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input
                        type="radio"
                        name={`degree[${index}].degreeLevel`}
                        id={`degree[${index}].degreeLevel-${degree.id}-masters`}
                        value="Магистр"
                        onChange={editModeFormData.handleChange}
                      />
                      <label htmlFor={`degree[${index}].degreeLevel-${degree.id}-masters`}>Магистр</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input
                        type="radio"
                        name={`degree[${index}].degreeLevel`}
                        id={`degree[${index}].degreeLevel-${degree.id}-specialist-level`}
                        value="Специалитет"
                        onChange={editModeFormData.handleChange}
                      />
                      <label htmlFor={`degree[${index}].degreeLevel-${degree.id}-specialist-level`}>Специалитет</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input
                        type="radio"
                        name={`degree[${index}].degreeLevel`}
                        id={`degree[${index}].degreeLevel-${degree.id}-pre-phd`}
                        value="Кандидат Наук"
                        onChange={editModeFormData.handleChange}
                      />
                      <label htmlFor={`degree[${index}].degreeLevel-${degree.id}-pre-phd`}>Кандидат Наук</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input
                        type="radio"
                        name={`degree[${index}].degreeLevel`}
                        id={`degree[${index}].degreeLevel-${degree.id}-phd`}
                        value="PhD"
                        onChange={editModeFormData.handleChange}
                      />
                      <label htmlFor={`degree[${index}].degreeLevel-${degree.id}-phd`}>PhD</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input
                        type="radio"
                        name={`degree[${index}].degreeLevel`}
                        id={`degree[${index}].degreeLevel-${degree.id}-doctor-of-science`}
                        value="Доктор Наук"
                        onChange={editModeFormData.handleChange}
                      />
                      <label htmlFor={`degree[${index}].degreeLevel-${degree.id}-doctor-of-science`}>Доктор Наук</label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`degree[${index}.speciality]`}>Специальность</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`degree[${index}].speciality`}
                    name={`degree[${index}].speciality`}
                    value={editModeFormData.values.degree[index].speciality}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="font-semibold">Годы Обучения</label>
                  <div className="flex space-x-2">
                    <div className="flex flex-col space-y-1">
                      <label>Начало</label>
                      <input
                        type="date"
                        className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                        id={`degree[${index}].dateStart`}
                        name={`degree[${index}].dateStart`}
                        value={editModeFormData.values.degree[index].dateStart.toISOString().slice(0, 10)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label>Конец</label>
                      <input
                        type="date"
                        className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                        id={`degree[${index}].dateEnd`}
                        name={`degree[${index}].dateEnd`}
                        value={editModeFormData.values.degree[index].dateEnd.toISOString().slice(0, 10)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
                      />
                    </div>
                  </div>
                </div>

                {highDigreeLevelCheck(editModeFormData.values.degree[index].degreeLevel) && (
                  <div className="flex space-x-2">
                    <div className="flex flex-col space-y-1">
                      <label htmlFor={`degree[${index}.givenBy]`}>Кем присужден</label>
                      <input
                        type="text"
                        className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                        id={`degree[${index}].givenBy`}
                        name={`degree[${index}].givenBy`}
                        value={editModeFormData.values.degree[index].givenBy}
                        onChange={editModeFormData.handleChange}
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label>Дата присуждения</label>
                      <input
                        type="date"
                        className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                        id={`degree[${index}].dateDegreeRecieved`}
                        name={`degree[${index}].dateDegreeRecieved`}
                        value={editModeFormData.values.degree[index].dateDegreeRecieved.toISOString().slice(0, 10)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
                      />
                    </div>
                  </div>
                )}
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
                    onClick={() => onCancelClick(index, degree.id)}
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
