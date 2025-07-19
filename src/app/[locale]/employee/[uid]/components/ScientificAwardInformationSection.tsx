"use client"

import { employeeApi } from "@/api/employee"
import { ApiError } from "@/api/types"
import Dialog from "@/components/Dialog"
import { EmployeeScientificAward } from "@/types/employee"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import { FormEvent, Fragment, useEffect, useState } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import * as yup from "yup"

interface Props {
  scientificAwards: EmployeeScientificAward[] | undefined
  employeeID: number
  locale: string
}

interface ScientificAwardState extends EmployeeScientificAward {
  editMode: boolean
}

export default function ScientificAwardInformationSection({ scientificAwards, employeeID, locale }: Props) {

  const queryClient = useQueryClient()

  const [scientificAwardState, setScientificAwardState] = useState<ScientificAwardState[]>([])
  useEffect(() => {
    setScientificAwardState(scientificAwards ? scientificAwards.map(v => ({
      ...v,
      employeeID: employeeID,
      editMode: false,
    })) : [])
  }, [])

  const scientificAwardQuery = useQuery<EmployeeScientificAward[], AxiosError<ApiError>, EmployeeScientificAward[]>({
    queryKey: ["employee-scientific-award", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getScientificAwardByEmployeeID(employeeID),
    initialData: scientificAwards ?? []
  })
  useEffect(() => {
    if (scientificAwardQuery.data) {
      setScientificAwardState([...scientificAwardQuery.data.map(v => ({
        ...v,
        employeeID: employeeID,
        editMode: false,
      }))])
    }
  }, [scientificAwardQuery.data])

  const addNewScientificAward = () => {
    const scientificAward = scientificAwardState.find(v => v.id === 0)
    if (scientificAward) {
      toast.error("Завершите текущее добавление.")
      return
    }
    setScientificAwardState([
      {
        id: 0,
        employeeID: employeeID,
        scientificAwardTitle: "",
        givenBy: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...scientificAwardState,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deleteScientificAwardMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deleteScientificAward,
  })
  const deleteScientificAward = () => {
    const loadingStateToast = toast.info("Удаление из категории Научные Награды...")
    deleteScientificAwardMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success("Удаление Успешно.")
        queryClient.invalidateQueries({
          queryKey: ["employee-scientific-award", {
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
        <p className="font-bold text-xl">Премии и награды</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewScientificAward()} />
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
        {scientificAwardState.map((scientificAward, index) =>
          !scientificAward.editMode
            ?
            <ScientificAwardDisplay
              key={scientificAward.id}
              scientificAward={scientificAward}
              enableEditMode={() => {
                const awards = scientificAwardState.map((v, i) => index === i ? ({ ...v, editMode: true }) : v)
                setScientificAwardState([...awards])
              }}
              onDeleteClick={() => {
                setIsDeleteDialogOpen(true)
                setToBeDeletedID(scientificAward.id)
              }}
            />
            :
            <ScientificAwardEdit
              key={scientificAward.id}
              scientificAward={scientificAward}
              employeeID={employeeID}
              locale={locale}
              index={index}
              disableEditMode={() => {
                const awards = scientificAwardState.map((v, i) => index === i ? ({ ...v, editMode: false }) : v)
                setScientificAwardState([...awards])
              }}
              removeNewScientificAwardOnClick={() => {
                const award = scientificAwardState.filter((_, i) => i != index)
                setScientificAwardState([...award])
              }}
            />
        )}
      </div>
    </div>
  )
}

interface ScientificAwardDisplayProps {
  scientificAward: EmployeeScientificAward | undefined
  enableEditMode: () => void
  onDeleteClick: () => void
}

function ScientificAwardDisplay({
  scientificAward,
  enableEditMode,
  onDeleteClick,
}: ScientificAwardDisplayProps) {
  if (!scientificAward) return null

  return (
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
            onClick={() => enableEditMode()}
          />
          <FaTrash
            color="red"
            onClick={() => onDeleteClick()}
            className="cursor-pointer"
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <h4 className="font-semibold text-l">Организация:</h4>
        <p>{scientificAward.givenBy}</p>
      </div>
    </div>
  )
}

interface ScientificAwardEditProps {
  scientificAward: EmployeeScientificAward | undefined
  employeeID: number
  index: number
  locale: string
  disableEditMode: () => void
  removeNewScientificAwardOnClick: () => void
}

function ScientificAwardEdit({
  scientificAward,
  employeeID,
  index,
  locale,
  disableEditMode,
  removeNewScientificAwardOnClick
}: ScientificAwardEditProps) {
  if (!scientificAward) return null

  const queryClient = useQueryClient()
  const createScientificAwardMutation = useMutation<EmployeeScientificAward, AxiosError<ApiError>, EmployeeScientificAward>({
    mutationFn: employeeApi.createScientificAward
  })
  const updateScientificAwardMutation = useMutation<EmployeeScientificAward, AxiosError<ApiError>, EmployeeScientificAward>({
    mutationFn: employeeApi.updateScientificAward
  })

  const form = useFormik({
    initialValues: {
      ...scientificAward,
    },
    validationSchema: yup.object({
      scientificAwardTitle: yup
        .string()
        .required("Название награды обязательно"),
      givenBy: yup
        .string()
        .required("Организация обязательна"),
    }),
    onSubmit: (values) => {
      if (values.id === 0) {
        const loadingStateToast = toast.info("Идёт сохранение новых данных в категории Премии и Награды...")
        createScientificAwardMutation.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success("Новые данные были успешно добавлены в категорию Премии и Награды.")
            queryClient.invalidateQueries({
              queryKey: ["employee-scientific-award", {
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
      updateScientificAwardMutation.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success("Данные были успешно обновлены в категорию Опыт работы.")
          queryClient.invalidateQueries({
            queryKey: ["employee-scientific-award", {
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

  const onCancelClick = (id: number) => {
    if (id === 0) {
      removeNewScientificAwardOnClick()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_scientificAwardTitle]`} className="font-semibold">Название награды</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_scientificAwardTitle`}
          name={`scientificAwardTitle`}
          value={form.values.scientificAwardTitle}
          onChange={form.handleChange}
        />
        {form.errors.scientificAwardTitle && form.touched.scientificAwardTitle && (
          <div className="text-red-500 font-bold text-sm">{form.errors.scientificAwardTitle}</div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_givenBy]`} className="font-semibold">Организация</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_givenBy`}
          name={`givenBy`}
          value={form.values.givenBy}
          onChange={form.handleChange}
        />
        {form.errors.givenBy && form.touched.givenBy && (
          <div className="text-red-500 font-bold text-sm">{form.errors.givenBy}</div>
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
          onClick={() => onCancelClick(scientificAward.id)}
        >
          Отмена
        </button>
      </div>
    </form>
  )
}
