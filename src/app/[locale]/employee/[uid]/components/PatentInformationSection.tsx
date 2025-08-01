"use client"

import { employeeApi } from "@/api/employee"
import { ApiError } from "@/api/types"
import Dialog from "@/components/Dialog"
import { EmployeePatent } from "@/types/employee"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import { FormEvent, Fragment, useEffect, useState, useTransition } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import { useTranslations } from "use-intl"
import * as yup from "yup"

interface Props {
  patents: EmployeePatent[] | undefined
  employeeID: number
  locale: string
  isCurrentUserProfile: boolean
}

interface PatentState extends EmployeePatent {
  editMode: boolean
}

export default function PatentInformationSection({ patents, employeeID, locale, isCurrentUserProfile }: Props) {
  const t = useTranslations("Employee.Patent")
  const queryClient = useQueryClient()
  const [patentState, setPatentState] = useState<PatentState[]>([])
  useEffect(() => {
    setPatentState(patents ? patents.map(v => ({
      ...v,
      employeeID: employeeID,
      editMode: false,
    })) : [])
  }, [])

  const patentQuery = useQuery<EmployeePatent[], AxiosError<ApiError>, EmployeePatent[]>({
    queryKey: ["employee-patent", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getPatentByEmployeeID(employeeID),
    initialData: patents ?? [],
    refetchOnMount: false,
  })
  useEffect(() => {
    if (patentQuery.data) {
      setPatentState([...patentQuery.data.map(v => ({
        ...v,
        employeeID: employeeID,
        editMode: false,
      }))])
    }
  }, [patentQuery.data])

  const addNewPatent = () => {
    const newPatent = patentState.find(v => v.id === 0)
    if (newPatent) {
      toast.info(t("finishCurrentNewEntry"))
      return
    }
    setPatentState([
      {
        id: 0,
        employeeID: employeeID,
        patentTitle: "",
        description: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        editMode: true,
      },
      ...patentState,
    ])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deletePatentMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deletePatent,
  })
  const deletePatent = () => {
    const loadingStateToast = toast.info(t("deleteLoadingToastText"))
    deletePatentMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success(t("deleteSuccessToastText"))
        queryClient.invalidateQueries({
          queryKey: ["employee-patent", {
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
        <p className="font-bold text-xl">{t("patentLabelText")}</p>
        {isCurrentUserProfile &&
          <div className="cursor-pointer">
            <FaPlus color="blue" onClick={() => addNewPatent()} />
          </div>
        }
      </div>
      <div className="flex flex-col space-y-2 px-6">
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <h4 className="text-center font-semibold">{t("deleteDialogHeaderText")}</h4>
          <div className="flex space-x-2 items-center justify-center mt-2">
            <div
              className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
              onClick={() => deletePatent()}
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
        {patentState.map((patent, index) =>
          !patent.editMode
            ?
            <PatentDisplay
              key={patent.id}
              patent={patent}
              isCurrentUserProfile={isCurrentUserProfile}
              enableEditMode={() => {
                const patent = patentState.map((v, i) => i == index ? { ...v, editMode: true } : v)
                setPatentState([...patent])
              }}
              onDeleteClick={() => {
                setIsDeleteDialogOpen(true)
                setToBeDeletedID(patent.id)
              }}

            />
            :
            <PatentEdit
              key={patent.id}
              patent={patent}
              employeeID={employeeID}
              locale={locale}
              index={index}
              disableEditMode={() => {
                const patent = patentState.map((v, i) => i == index ? { ...v, editMode: false } : v)
                setPatentState([...patent])
              }}
              removeNewPatentOnCancel={() => {
                const patent = patentState.filter((_, i) => i != index)
                setPatentState([...patent])
              }}
            />
        )}
      </div>
    </div>
  )
}

interface PatentDisplayProps {
  patent: EmployeePatent | undefined
  isCurrentUserProfile: boolean
  enableEditMode: () => void
  onDeleteClick: () => void
}

function PatentDisplay({ patent, enableEditMode, onDeleteClick, isCurrentUserProfile }: PatentDisplayProps) {
  if (!patent) return null
  const t = useTranslations("Employee.Patent")

  return (
    <div className="flex flex-col space-y-1 border-b-1 py-2">
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <h4 className="font-semibold text-l">{t("displayPatentTitleLabelText")}</h4>
          <p>{patent.patentTitle}</p>
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
        <h4 className="font-semibold text-l">{t("displayDescriptionLabelText")}</h4>
        <p>{patent.description}</p>
      </div>
    </div>
  )
}

interface PatentEditProps {
  patent: EmployeePatent | undefined
  employeeID: number
  index: number
  locale: string
  disableEditMode: () => void
  removeNewPatentOnCancel: () => void
}

function PatentEdit({
  patent,
  employeeID,
  index,
  locale,
  disableEditMode,
  removeNewPatentOnCancel,
}: PatentEditProps) {
  if (!patent) return null

  const t = useTranslations("Employee.Patent")
  const queryClient = useQueryClient()
  const createPatentMutation = useMutation<EmployeePatent, AxiosError<ApiError>, EmployeePatent>({
    mutationFn: employeeApi.createPatent,
  })

  const updatePatentMutation = useMutation<EmployeePatent, AxiosError<ApiError>, EmployeePatent>({
    mutationFn: employeeApi.updatePatent,
  })

  const form = useFormik({
    initialValues: {
      ...patent,
    },
    validationSchema: yup.object({
      patentTitle: yup
        .string()
        .required(t("patentTitleValidationRequiredText")),
      description: yup
        .string()
        .required(t("descriptionValidationRequiredText")),
    }),
    onSubmit: (values) => {
      if (values.id === 0) {
        const loadingStateToast = toast.info(t("createLoadingToastText"))
        createPatentMutation.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success(t("createSuccessToastText"))
            queryClient.invalidateQueries({
              queryKey: ["employee-patent", {
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
      updatePatentMutation.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success(t("updateSuccessToastText"))
          queryClient.invalidateQueries({
            queryKey: ["employee-patent", {
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

  const onCancelClick = (id: number) => {
    if (id === 0) {
      removeNewPatentOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_patentTitle`} className="font-semibold">{t("patentTileLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_patentTitle`}
          name={`patentTitle`}
          value={form.values.patentTitle}
          onChange={form.handleChange}
        />
        {form.errors.patentTitle && form.touched.patentTitle && (
          <div className="text-red-500 font-bold text-sm">{form.errors.patentTitle}</div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}-description`} className="font-semibold">{t("descriptionLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_description`}
          name={`description`}
          value={form.values.description}
          onChange={form.handleChange}
        />
        {form.errors.description && form.touched.description && (
          <div className="text-red-500 font-bold text-sm">{form.errors.description}</div>
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
          onClick={() => onCancelClick(patent.id)}
        >
          {t("cancelButtonText")}
        </button>
      </div>
    </form>
  )
}
