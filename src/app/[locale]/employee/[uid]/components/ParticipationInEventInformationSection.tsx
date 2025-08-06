"use client"

import { employeeApi } from "@/api/employee"
import { ApiError } from "@/api/types"
import Dialog from "@/components/Dialog"
import { EmployeeParticipationInEvent } from "@/types/employee"
import formatDate from "@/utils/dateFormatter"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import { ChangeEvent, useEffect, useState } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import { useTranslations } from "use-intl"
import * as yup from "yup"

interface Props {
  participationInEvents: EmployeeParticipationInEvent[] | undefined
  employeeID: number
  locale: string
  isCurrentUserProfile: boolean
}

interface PIEState extends EmployeeParticipationInEvent {
  editMode: boolean
}

export default function ParticipationInEventInfromationSection({
  participationInEvents,
  employeeID,
  locale,
  isCurrentUserProfile,
}: Props) {
  const queryClient = useQueryClient()
  const t = useTranslations("Employee.PIE")

  const [pieState, setPIEState] = useState<PIEState[]>([])
  useEffect(() => {
    setPIEState(participationInEvents ? participationInEvents.map(v => ({
      ...v,
      eventDate: new Date(v.eventDate),
      editMode: false,
    })) : [])
  }, [])

  const pieQuery = useQuery<EmployeeParticipationInEvent[], AxiosError<ApiError>, EmployeeParticipationInEvent[]>({
    queryKey: ["employee-participation-in-event", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getPIEByEmployeeID(employeeID),
    initialData: participationInEvents ?? [],
    refetchOnMount: false,
  })
  useEffect(() => {
    if (pieQuery.data) {
      setPIEState([...pieQuery.data.map(v => ({
        ...v,
        eventDate: new Date(v.eventDate),
        editMode: false,
      }))])
    }
  }, [pieQuery.data])

  const addNewPIE = () => {
    const pie = pieState.find(v => v.id === 0)
    console.log(pie)
    if (pie) {
      toast.error(t("finishCurrentNewEntry"))
      return
    }

    setPIEState([{
      id: 0,
      employeeID: employeeID,
      eventDate: new Date(),
      eventTitle: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      editMode: true,
    }, ...pieState])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deletePIEMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deletePIE,
  })
  const deleteWorkExperience = () => {
    const loadingStateToast = toast.info(t("deleteLoadingToastText"))
    deletePIEMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success(t("deleteSuccessToastText"))
        queryClient.invalidateQueries({
          queryKey: ["employee-participation-in-event", {
            employeeID: employeeID,
            locale: locale,
          }]
        })
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(`${t("deleteErrorToastText")} - ${error.response.data.message}`)
        } else {
          toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
        }
      }
    })
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">{t("pieLabelText")}</p>
        {isCurrentUserProfile &&
          <div className="cursor-pointer">
            <FaPlus color="blue" onClick={() => addNewPIE()} />
          </div>
        }
      </div>
      <div className="flex flex-col space-y-1 px-6">
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <h4 className="text-center font-semibold">{t("deleteDialogHeaderText")}</h4>
          <div className="flex space-x-2 items-center justify-center mt-2">
            <div
              className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
              onClick={() => deleteWorkExperience()}
            >
              {t("deleteDialogDeleteButtonText")}
            </div>
            <div
              className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("deleteDialogCancelButtonText")}
            </div>
          </div>
        </Dialog>
        {pieState.map((pie, index) => 
          !pie.editMode
            ? 
            <PIEDisplay 
              key={pie.id}
              pie={pie}
              isCurrentUserProfile={isCurrentUserProfile}
              enableEditMode={() => {
                const pieTemp = pieState.map((v, i) => i === index ? {...v, editMode: true}: v)
                setPIEState([...pieTemp])
              }}
              onDeleteClick={() => {
                setIsDeleteDialogOpen(true)
                setToBeDeletedID(pie.id)
              }}
            />
            :
            <PIEEdit
             key={pie.id}
             pie={pie}
             employeeID={employeeID}
             locale={locale}
             index={index}
             disableEditMode={() => {
              const pieTemp = pieState.map((v, i) => i == index ? {...v, editMode: false}: v)
              setPIEState([...pieTemp])
             }} 
             removeNewPIEOnCancel={() => {
                const pieTemp = pieState.filter((_, i) => i != index)
                setPIEState([...pieTemp])
             }}
             />
        )}
      </div>
    </div>
  )
}

interface PIEDisplayProps {
  pie: EmployeeParticipationInEvent | undefined
  isCurrentUserProfile: boolean
  enableEditMode: () => void
  onDeleteClick: () => void
}

function PIEDisplay({
  pie,
  isCurrentUserProfile,
  enableEditMode,
  onDeleteClick,
}: PIEDisplayProps) {
  if (!pie) return null;
  const t = useTranslations("Employee.PIE")

  return (
    <div className="flex flex-col space-y-1 border-b-1 py-2">
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <h4 className="font-semibold text-l">{t("displayEventTitleLabelText")}</h4>
          <p>{pie.eventTitle}</p>
        </div>
        {isCurrentUserProfile &&
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
        }
      </div>
      <div className="flex space-x-2">
        <h4 className="font-semibold text-l">{t("displayEventDateTitleLabelText")}</h4>
        <p>{formatDate(pie.eventDate)}</p>
      </div>
    </div>
  )
}

interface PIEEditProps {
  pie: EmployeeParticipationInEvent | undefined
  employeeID: number
  index: number
  locale: string
  disableEditMode: () => void
  removeNewPIEOnCancel: () => void
}

function PIEEdit({
  pie,
  employeeID,
  index,
  locale,
  disableEditMode,
  removeNewPIEOnCancel,
}: PIEEditProps) {
  if (!pie) return null
  const t =useTranslations("Employee.PIE")

  const queryClient = useQueryClient()
  const createPIE = useMutation<EmployeeParticipationInEvent, AxiosError<ApiError>, EmployeeParticipationInEvent>({
    mutationFn: employeeApi.createPIE,
  })
  const updatePIE = useMutation<EmployeeParticipationInEvent, AxiosError<ApiError>, EmployeeParticipationInEvent>({
    mutationFn: employeeApi.updatePIE
  })

  const form = useFormik({
    initialValues: {
      ...pie,
    },
    validationSchema: yup.object({
      eventTitle: yup
        .string()
        .required(t("eventTitleValidationRequiredText")),
      eventDate: yup
        .date()
        .required(t("eventDateValidationRequiredText"))
        .max(new Date(), t("evenDateValidationMaxText"))
    }),
    onSubmit: (values) => {
      if (values.id === 0) {
        const loadingStateToast = toast.info(t("createLoadingToastText"))
        createPIE.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success(t("createSuccessToastText"))
            queryClient.invalidateQueries({
              queryKey: ["employee-participation-in-event", {
                employeeID: employeeID,
                locale: locale
              }]
            })
            disableEditMode()
          },
          onError: (error) => {
            if (error.response && error.response.data && error.response.data.message) {
              toast.error(`${t("createErrorToastText")} - ${error.response.data.message}`)
            } else {
              toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
            }
          }
        })
        return
      }

      const loadingStateToast = toast.info(t("updateLoadingToastText"))
      updatePIE.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success(t("updateSuccessToastText"))
          queryClient.invalidateQueries({
            queryKey: ["employee-participation-in-event", {
              employeeID: employeeID,
              locale: locale,
            }]
          })
          disableEditMode()
        },
        onError: (error) => {
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(`${t("updateErrorToastText")} - ${error.response.data.message}`)
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
      removeNewPIEOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_eventTitle`} className="font-semibold">{t("patentTileLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_eventTitle`}
          name={`eventTitle`}
          value={form.values.eventTitle}
          onChange={form.handleChange}
        />
        {form.errors.eventTitle && form.touched.eventTitle && (
          <div className="text-red-500 font-bold text-sm">{form.errors.eventTitle}</div>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <label>{t("eventDateLabelText")}</label>
        <input
          type="date"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_eventDate`}
          name={`eventDate`}
          value={form.values.eventDate.toISOString().slice(0, 10)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
        />
        {form.errors.eventDate && form.touched.eventDate && (
          //@ts-ignore
          <div className="text-red-500 font-bold text-sm">{form.errors.eventDate}</div>
        )}
      </div>
      <div className="flex space-x-2 items-center justify-start">
        <button
          type="submit"
          className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded cursor-pointer"
        >
          {t("saveButtonText")}
        </button>
        <button
          type="button"
          className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
          onClick={() => onCancelClick(pie.id)}
        >
          {t("cancelButtonText")}
        </button>
      </div>
    </form>
  )
}