"use client"

import { employeeApi } from "@/api/employee"
import { ApiError } from "@/api/types"
import Dialog from "@/components/Dialog"
import { EmployeeParticipationInProfessionalCommunity, EmployeeWorkExperience } from "@/types/employee"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import { FormEvent, Fragment, useEffect, useState } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import * as yup from "yup"

interface Props {
  pipcs: EmployeeParticipationInProfessionalCommunity[] | undefined
  employeeID: number
  locale: string
}

interface PIPCState extends EmployeeParticipationInProfessionalCommunity {
  editMode: boolean
}

export default function ParticipationInProfessionalCommunityInformationSection({ pipcs, employeeID, locale }: Props) {
  const queryClient = useQueryClient()

  const [pipcState, setPipcState] = useState<PIPCState[]>([])
  useEffect(() => {
    setPipcState(pipcs ? pipcs.map((v) => ({
      ...v,
      employeeID: employeeID,
      editMode: false,
    })) : [])
  }, [])

  const pipcQuery = useQuery<EmployeeParticipationInProfessionalCommunity[], AxiosError<ApiError>, EmployeeParticipationInProfessionalCommunity[]>({
    queryKey: ["employee-pipc", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getPIPCByEmployeeID(employeeID),
    initialData: pipcs ?? [],
  })
  useEffect(() => {
    if (pipcQuery.data) {
      setPipcState([...pipcQuery.data.map(v => ({
        ...v,
        employeeID: employeeID,
        editMode: false,
      }))])
    }
  }, [pipcQuery.data])

  const addNewPatent = () => {
    const newPIPC = pipcState.find(v => v.id === 0)
    if (newPIPC) {
      toast.error("Завершите текущее добавление.")
      return
    }

    setPipcState([
      {
        id: 0,
        employeeID: employeeID,
        professionalCommunityTitle: "",
        roleInProfessionalCommunity: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...pipcState,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deletePIPCMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deletePIPC,
  })
  const deletePIPC = () => {
    const loadingStateToast = toast.info("Удаление из категории Участие в профессиональных сообществах...")
    deletePIPCMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success("Удаление Успешно.")
        queryClient.invalidateQueries({
          queryKey: ["employee-pipc", {
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
        {pipcState.map((pipc, index) =>
          !pipc.editMode
            ?
            <PIPCDisplay
              key={pipc.id}
              pipc={pipc}
              enableEditMode={() => {
                const pipc = pipcState.map((v, i) => i == index ? { ...v, editMode: true } : v)
                setPipcState([...pipc])
              }}
              onDeleteClick={() => {
                setIsDeleteDialogOpen(true)
                setToBeDeletedID(pipc.id)
              }}
            />
            :
            <PIPCEdit
              key={pipc.id}
              pipc={pipc}
              employeeID={employeeID}
              locale={locale}
              index={index}
              disableEditMode={() => {
                const pipc = pipcState.map((v, i) => i == index ? { ...v, editMode: false } : v)
                setPipcState([...pipc])
              }}
              removeNewPIPCOnCancel={() => {
                const pipc = pipcState.filter((_, i) => i != index)
                setPipcState([...pipc])
              }}
            />
        )}
      </div>
    </div>
  )
}

interface PIPCDisplayProps {
  pipc: EmployeeParticipationInProfessionalCommunity | undefined
  enableEditMode: () => void
  onDeleteClick: () => void
}

function PIPCDisplay({
  pipc,
  enableEditMode,
  onDeleteClick
}: PIPCDisplayProps) {
  if (!pipc) return null

  return (
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
        <h4 className="font-semibold text-l">Роль:</h4>
        <p>{pipc.roleInProfessionalCommunity}</p>
      </div>
    </div>
  )
}

interface PIPCEditProps {
  pipc: EmployeeParticipationInProfessionalCommunity | undefined
  employeeID: number
  index: number
  locale: string
  disableEditMode: () => void
  removeNewPIPCOnCancel: () => void
}

function PIPCEdit({
  pipc,
  employeeID,
  index,
  locale,
  disableEditMode,
  removeNewPIPCOnCancel,
}: PIPCEditProps) {
  if (!pipc) return null


  const queryClient = useQueryClient()
  const createPIPC = useMutation<EmployeeParticipationInProfessionalCommunity, AxiosError<ApiError>, EmployeeParticipationInProfessionalCommunity>({
    mutationFn: employeeApi.createPIPC,
  })

  const updatePIPC = useMutation<EmployeeParticipationInProfessionalCommunity, AxiosError<ApiError>, EmployeeParticipationInProfessionalCommunity>({
    mutationFn: employeeApi.updatePIPC,
  })

  const form = useFormik({
    initialValues: {
      ...pipc,
    },
    validationSchema: yup.object({
      professionalCommunityTitle: yup
        .string()
        .required("Название обязательно"),
      roleInProfessionalCommunity: yup
        .string()
        .required("Роль обязательна"),
    }),
    onSubmit: values => {
      if (values.id === 0) {
        const loadingStateToast = toast.info("Идёт сохранение новых данных в категории Участие в профессиональных сообществах...")
        createPIPC.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success("Новые данные были успешно добавлены в категорию Участие в профессиональных сообществах.")
            queryClient.invalidateQueries({
              queryKey: ["employee-pipc", {
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

      const loadingStateToast = toast.info("Идёт обновление данных в категории Участие в профессиональных сообществах...")
      updatePIPC.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success("Данные были успешно обновлены в категорию Участие в профессиональных сообществах.")
          queryClient.invalidateQueries({
            queryKey: ["employee-pipc", {
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
      removeNewPIPCOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_professionalCommunityTitle]`} className="font-semibold">Название</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_professionalCommunityTitle`}
          name={`professionalCommunityTitle`}
          value={form.values.professionalCommunityTitle}
          onChange={form.handleChange}
        />
        {form.errors.professionalCommunityTitle && form.touched.professionalCommunityTitle && (
          <div className="text-red-500 font-bold text-sm">{form.errors.professionalCommunityTitle}</div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_roleInProfessionalCommunity]`} className="font-semibold">Роль</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_roleInProfessionalCommunity`}
          name={`roleInProfessionalCommunity`}
          value={form.values.roleInProfessionalCommunity}
          onChange={form.handleChange}
        />
        {form.errors.roleInProfessionalCommunity && form.touched.roleInProfessionalCommunity && (
          <div className="text-red-500 font-bold text-sm">{form.errors.roleInProfessionalCommunity}</div>
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
          onClick={() => onCancelClick(pipc.id)}
        >
          Отмена
        </button>
      </div>

    </form>
  )
}
