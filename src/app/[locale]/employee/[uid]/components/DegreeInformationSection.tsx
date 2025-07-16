"use client"

import { employeeApi } from "@/api/employee";
import { ApiError } from "@/api/types";
import Dialog from "@/components/Dialog";
import { EmployeeDegree } from "@/types/employee";
import formatDate from "@/utils/dateFormatter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useFormik } from "formik";
import { ChangeEvent, useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

interface Props {
  degree: EmployeeDegree[] | undefined
  employeeID: number
}

interface DegreeState extends EmployeeDegree {
  editMode: boolean
}

export default function DegreeInformationSection({ degree, employeeID }: Props) {


  const [degreeState, setDegreeState] = useState<DegreeState[]>(degree?.map(v => ({ ...v, editMode: false })) ?? [])
  const degreeQuery = useQuery<EmployeeDegree[], Error, EmployeeDegree[]>({
    queryKey: ["employee-degrees", { employeeID: employeeID }],
    queryFn: () => employeeApi.getDegreesByEmployeeID(employeeID),
    initialData: degree ?? [],
  })
  useEffect(() => {
    if (degreeQuery.data.length) {
      setDegreeState([...degreeQuery.data.map(v => ({ ...v, editMode: false }))])
    }
  }, [degreeQuery.data])

  const addNewDegree = () => {
    setDegreeState([{
      id: 0,
      degreeLevel: "",
      recievedFrom: "",
      speciality: "",
      dateStart: new Date(),
      dateEnd: new Date(),
      givenBy: "",
      dateDegreeRecieved: new Date(),
      editMode: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, ...degreeState])
  }

  const queryClient = useQueryClient()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedIndex, setToBeDeletedIndex] = useState(-1)
  const deleteDegreeMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deleteDegree
  })
  const deleteDegree = () => {
    const loadingStateToast = toast.info("Удаление из категории образование...")
    deleteDegreeMutation.mutate(toBeDeletedIndex, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success("Удаление Успешно.")
        queryClient.invalidateQueries({
          queryKey: ["employee-degrees", { employeeID: employeeID }]
        })
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(`{t("onUpdateErrorToastText")} - ${error.response.data.message}`)
        } else {
          toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
        }
      }
    })

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
        {degreeState.map((degree, index) =>
          !degree.editMode
            ?
            <DegreeDisplay
              key={degree.id}
              degree={degree}
              enableEditMode={() => {
                const editModeEnabled = degreeState.map((v, i) => i == index ? { ...v, editMode: true } : v)
                setDegreeState([...editModeEnabled])
              }}
              onDeleteClick={() => {
                setIsDeleteDialogOpen(true)
                setToBeDeletedIndex(index)
              }}
            />
            :
            <DegreeEdit
              key={degree.id}
              degree={degree}
              index={index}
              employeeID={employeeID}
              disableEditMode={() => {
                const editModeEnabled = degreeState.map((v, i) => i == index ? { ...v, editMode: false } : v)
                setDegreeState([...editModeEnabled])

              }}
              removeNewDegreeOnCancel={() => {
                const degrees = degreeState.filter((_, i) => i != index)
                console.log(degrees)
                setDegreeState([...degrees])
              }}
              updateDegreeState={(values: DegreeState) => {
                const degrees = degreeState.map((v, i) => i == index ? values : v)
                setDegreeState(degrees)
              }}
            />

        )}
      </div>
    </div>
  )
}

interface DegreeDisplayProps {
  degree: EmployeeDegree | undefined
  enableEditMode: () => void
  onDeleteClick: () => void
}

function DegreeDisplay({ degree, enableEditMode, onDeleteClick }: DegreeDisplayProps) {
  if (!degree) return null

  return (
    <div className="flex flex-col space-y-1  border-b-1 pb-2">
      <div className="flex justify-between items-center border-gray-500">
        <p className="font-semibold text-xl">{degree.recievedFrom}</p>
        <div className="flex space-x-2">
          <FaPen
            color="blue"
            onClick={() => enableEditMode()}
            className="cursor-pointer"
          />
          <FaTrash
            color="red"
            onClick={() => onDeleteClick()}
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
          </div>
        </div>
      </div>
    </div>
  )
}

interface DegreeEditProps {
  index: number
  employeeID: number
  degree: EmployeeDegree | undefined
  disableEditMode: () => void
  removeNewDegreeOnCancel: () => void
  updateDegreeState: (values: DegreeState) => void
}

function DegreeEdit({ degree, index, employeeID, disableEditMode, removeNewDegreeOnCancel, updateDegreeState }: DegreeEditProps) {
  if (!degree) return null

  const queryClient = useQueryClient()
  const createDegreeMutation = useMutation<EmployeeDegree, AxiosError<ApiError>, EmployeeDegree>({
    mutationFn: employeeApi.createDegree,
  })

  const updateDegreeMutation = useMutation<EmployeeDegree, AxiosError<ApiError>, EmployeeDegree>({
    mutationFn: employeeApi.updateDegree,
  })

  const form = useFormik({
    initialValues: {
      ...degree,
    },
    onSubmit: values => {
      if (values.id === 0) {
        const loadingStateToast = toast.info("Идёт сохранение новых данных в категории Образование...")
        createDegreeMutation.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success("Новые данные были успешно добавлены в категорию Образование.")
            queryClient.invalidateQueries({
              queryKey: ["employee-degrees", { employeeID: employeeID }]
            })
            disableEditMode()
          },
          onError: (error) => {
            if (error.response && error.response.data && error.response.data.message) {
              toast.error(`{t("onUpdateErrorToastText")} - ${error.response.data.message}`)
            } else {
              toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
            }
          }
        })
        return
      }

      const loadingStateToast = toast.info("Идёт обновление данных в категории Образование...")
      updateDegreeMutation.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success("Данные были успешно обновлены в категорию Образование.")
          queryClient.invalidateQueries({
            queryKey: ["employee-degrees", { employeeID: employeeID }]
          })
          disableEditMode()
        },
        onError: (error) => {
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(`{t("onUpdateErrorToastText")} - ${error.response.data.message}`)
          } else {
            toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
          }
        }
      })
    }
  })

  const onDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    form.setFieldValue(e.target.name, new Date(e.target.value))
  }

  const highDigreeLevelCheck = (degreeLevel: string): boolean => {
    return degreeLevel == "Кандидат Наук" || degreeLevel == "PhD" || degreeLevel == "Доктор Наук"
  }

  const onCancelClick = (id: number) => {
    if (id === 0) {
      removeNewDegreeOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_recievedFrom`} className="font-semibold">Университет</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_recievedFrom`}
          name="recievedFrom"
          value={form.values.recievedFrom}
          onChange={form.handleChange}
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">Степень</label>
        <div className="flex space-x-2">
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_bachelor`}
              value="Бакалавр"
              onChange={form.handleChange}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_bachelor`}>Бакалавр</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_masters`}
              value="Магистр"
              onChange={form.handleChange}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_masters`}>Магистр</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_specialist_level`}
              value="Специалитет"
              onChange={form.handleChange}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_specialist_level`}>Специалитет</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_pre_phd`}
              value="Кандидат Наук"
              onChange={form.handleChange}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_pre_phd`}>Кандидат Наук</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name={`degreeLevel`}
              id={`${index}_degreeLevel_${degree.id}_phd`}
              value="PhD"
              onChange={form.handleChange}
            />
            <label htmlFor={`${index}_degreeLevel-${degree.id}_phd`}>PhD</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_doctor_of_science`}
              value="Доктор Наук"
              onChange={form.handleChange}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_doctor_of_science`}>Доктор Наук</label>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor={`degree[${index}.speciality]`}>Специальность</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_speciality`}
          name="speciality"
          value={form.values.speciality}
          onChange={form.handleChange}
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
              id={`${index}_dateStart`}
              name="dateStart"
              value={form.values.dateStart.toISOString().slice(0, 10)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label>Конец</label>
            <input
              type="date"
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              id={`${index}_dateEnd`}
              name="dateEnd"
              value={form.values.dateEnd.toISOString().slice(0, 10)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
            />
          </div>
        </div>
      </div>

      {highDigreeLevelCheck(form.values.degreeLevel) && (
        <div className="flex space-x-2">
          <div className="flex flex-col space-y-1">
            <label htmlFor={`degree[${index}.givenBy]`}>Кем присужден</label>
            <input
              type="text"
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              id={`${index}_givenBy`}
              name="givenBy"
              value={form.values.givenBy}
              onChange={form.handleChange}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label>Дата присуждения</label>
            <input
              type="date"
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              id={`${index}_dateDegreeRecieved`}
              name="dateDegreeRecieved"
              value={form.values.dateDegreeRecieved.toISOString().slice(0, 10)}
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
          onClick={() => onCancelClick(degree.id)}
        >
          Отмена
        </button>
      </div>

    </form>
  )
}


