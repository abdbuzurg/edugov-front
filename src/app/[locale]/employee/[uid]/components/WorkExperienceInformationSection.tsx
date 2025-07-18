"use client"

import { employeeApi } from "@/api/employee";
import { ApiError } from "@/api/types";
import Dialog from "@/components/Dialog";
import { EmployeeWorkExperience } from "@/types/employee";
import formatDate from "@/utils/dateFormatter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Axios, AxiosError } from "axios";
import { useFormik } from "formik";
import { ChangeEvent, FormEvent, Fragment, useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import * as yup from "yup"

interface Props {
  workExperience: EmployeeWorkExperience[] | undefined
  employeeID: number
  locale: string
}

interface WorkExperienceState extends EmployeeWorkExperience {
  editMode: boolean
}

export default function WorkExperienceInformationSection({ workExperience, employeeID, locale }: Props) {
  const queryClient = useQueryClient()

  const [workExperienceState, setWorkExperienceState] = useState<WorkExperienceState[]>([])
  useEffect(() => {
    setWorkExperienceState(workExperience ? workExperience.map(v => ({
      ...v,
      dateEnd: new Date(v.dateEnd),
      dateStart: new Date(v.dateStart),
      employeeID: employeeID,
      editMode: false,
    })) : [])
  }, [])

  const workExperienceQuery = useQuery<EmployeeWorkExperience[], AxiosError<ApiError>, EmployeeWorkExperience[]>({
    queryKey: ["employee-work-experience", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getWorkExperienceByEmployeeID(employeeID)
  })
  useEffect(() => {
    if (workExperienceQuery.data) {
      setWorkExperienceState([...workExperienceQuery.data.map(v => ({
        ...v,
        dateEnd: new Date(v.dateEnd),
        dateStart: new Date(v.dateStart),
        employeeID: employeeID,
        editMode: false,
      }))])
    }
  }, [workExperienceQuery.data])

  const addNewWorkExperience = () => {
    const workExperience = workExperienceState.find((v) => v.id == 0)
    if (workExperience) {
      toast.error("Завершите текущее добавление.")
      return
    }
    setWorkExperienceState([{
      id: 0,
      employeeID: employeeID,
      workplace: "",
      jobTitle: "",
      description: "",
      dateStart: new Date(),
      dateEnd: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      editMode: true,
    }, ...workExperienceState])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deleteWorkExperienceMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deleteWorkExprience,
  })
  const deleteWorkExperience = () => {
    const loadingStateToast = toast.info("Удаление из категории образование...")
    deleteWorkExperienceMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success("Удаление Успешно.")
        queryClient.invalidateQueries({
          queryKey: ["employee-work-experience", {
            employeeID: employeeID,
            locale: locale,
          }]
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
        <p className="font-bold text-xl">Опыт работы</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewWorkExperience()} />
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
              onClick={() => deleteWorkExperience()}
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
        {workExperienceState.map((experience, index) =>
          !experience.editMode
            ?
            <WorkExperienceDisplay
              key={experience.id}
              workExperience={experience}
              enableEditMode={() => {
                const experience = workExperienceState.map((v, i) => i == index ? { ...v, editMode: true } : v)
                setWorkExperienceState([...experience])
              }}
              onDeleteClick={() => {
                setIsDeleteDialogOpen(true)
                setToBeDeletedID(experience.id)
              }}
            />
            :
            <WorkExperienceEdit
              key={experience.id}
              workExperience={experience}
              employeeID={employeeID}
              locale={locale}
              index={index}
              disableEditMode={() => {
                const experience = workExperienceState.map((v, i) => i == index ? { ...v, editMode: false } : v)
                setWorkExperienceState([...experience])
              }}
              removeNewWorkExperienceOnCancel={() => {
                const workExperience = workExperienceState.filter((_, i) => i != index)
                setWorkExperienceState([...workExperience])
              }}
            />
        )}
      </div>
    </div>
  )
}

interface WorkExperienceDisplayProps {
  workExperience: EmployeeWorkExperience | undefined
  enableEditMode: () => void
  onDeleteClick: () => void
}

function WorkExperienceDisplay({ workExperience, enableEditMode, onDeleteClick }: WorkExperienceDisplayProps) {
  if (!workExperience) return null

  return (
    <div className="flex flex-col space-y-1  border-b-1 pb-2">
      <div className="flex justify-between items-center border-gray-500">
        <p className="font-semibold text-xl">{workExperience.workplace}</p>
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
        <h5>{workExperience.jobTitle}</h5>
        <div className="flex space-x-2">
          <h4>{formatDate(workExperience.dateStart)} - {formatDate(workExperience.dateEnd)}</h4>
        </div>
        <p>{workExperience.description}</p>
      </div>
    </div>
  )
}

interface WorkExperienceEditProps {
  workExperience: EmployeeWorkExperience | undefined
  employeeID: number
  index: number
  locale: string
  disableEditMode: () => void
  removeNewWorkExperienceOnCancel: () => void
}

function WorkExperienceEdit({ workExperience, employeeID, index, locale, removeNewWorkExperienceOnCancel, disableEditMode }: WorkExperienceEditProps) {
  if (!workExperience) return null

  const queryClient = useQueryClient()
  const createWorkExperience = useMutation<EmployeeWorkExperience, AxiosError<ApiError>, EmployeeWorkExperience>({
    mutationFn: employeeApi.createWorkExperience,
  })

  const updateWorkExperienceMutation = useMutation<EmployeeWorkExperience, AxiosError<ApiError>, EmployeeWorkExperience>({
    mutationFn: employeeApi.updateWorkExperience,
  })

  const form = useFormik({
    initialValues: {
      ...workExperience,
    },
    validationSchema: yup.object({
      workplace: yup
        .string()
        .required("Компания или организция обязательна"),
      jobTitle: yup
        .string()
        .required("Должность обязательна"),
      description: yup
        .string()
        .required("Краткое описание должности обязательна"),
      dateStart: yup
        .date()
        .required("Начало обязательно")
        .max(new Date(), "Начало не можем быть в будущем"),
      dateEnd: yup
        .date()
        .required("Конец обязательно")
        .max(new Date(), "Конец не можем в будущем.")
        .min(yup.ref('dateStart'), "Конец не может быть перед началом.")
    }),
    onSubmit: values => {
      if (values.id === 0) {
        const loadingStateToast = toast.info("Идёт сохранение новых данных в категории Опыт работы...")
        createWorkExperience.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success("Новые данные были успешно добавлены в категорию Опыт работы.")
            queryClient.invalidateQueries({
              queryKey: ["employee-work-experience", {
                employeeID: employeeID,
                locale: locale
              }]
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

      const loadingStateToast = toast.info("Идёт обновление данных в категории Опыт работы...")
      updateWorkExperienceMutation.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success("Данные были успешно обновлены в категорию Опыт работы.")
          queryClient.invalidateQueries({
            queryKey: ["employee-work-experience", {
              employeeID: employeeID,
              locale: locale,
            }]
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

  const onCancelClick = (id: number) => {
    if (id === 0) {
      removeNewWorkExperienceOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_workplace]`} className="font-semibold">Компания или организация</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_workplace`}
          name={`workplace`}
          value={form.values.workplace}
          onChange={form.handleChange}
        />
      </div>
      {form.errors.workplace && form.touched.workplace && (
        <div className="text-red-500 font-bold text-sm">{form.errors.workplace}</div>
      )}
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_workplace]`} className="font-semibold">Должность</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_jobTitle`}
          name={`jobTitle`}
          value={form.values.jobTitle}
          onChange={form.handleChange}
        />
      </div>
      {form.errors.jobTitle && form.touched.jobTitle && (
        <div className="text-red-500 font-bold text-sm">{form.errors.jobTitle}</div>
      )}

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">Период</label>
        <div className="flex space-x-2">
          <div className="flex flex-col space-y-1">
            <label>Начало</label>
            <input
              type="date"
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              id={`${index}_dateStart`}
              name={`dateStart`}
              value={form.values.dateStart.toISOString().slice(0, 10)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
            />
            {form.errors.dateStart && form.touched.dateStart && (
              //@ts-ignore
              <div className="text-red-500 font-bold text-sm">{form.errors.dateStart}</div>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <label>Конец</label>
            <input
              type="date"
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              id={`${index}_dateEnd`}
              name={`dateEnd`}
              value={form.values.dateEnd.toISOString().slice(0, 10)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
            />
            {form.errors.dateEnd && form.touched.dateEnd && (
              //@ts-ignore
              <div className="text-red-500 font-bold text-sm">{form.errors.dateEnd}</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_description]`} className="font-semibold">Краткое описание должности</label>
        <textarea
          className="border p-2 rounded-xl border-gray-400 bg-gray-300 max-w-full min-h-[150px]"
          id={`${index}_description`}
          name={`description`}
          value={form.values.description}
          onChange={form.handleChange}
        ></textarea>
        {form.errors.description && form.touched.description && (
          <div className="text-red-500 font-bold text-sm">{form.errors.description}</div>
        )}
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
          onClick={() => onCancelClick(workExperience.id)}
        >
          Отмена
        </button>
      </div>
    </form>
  )
}