"use client"

import { employeeApi } from "@/api/employee"
import { ApiError } from "@/api/types"
import Dialog from "@/components/Dialog"
import { EmployeeResearchActivity, EmployeeWorkExperience } from "@/types/employee"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import * as yup from "yup"

interface Props {
  researchActivities: EmployeeResearchActivity[] | undefined
  employeeID: number
  locale: string
  isCurrentUserProfile: boolean
}

interface ResearchActivityState extends EmployeeResearchActivity {
  editMode: boolean
}

export default function ResearchActivityInformationSection({ researchActivities, employeeID, locale, isCurrentUserProfile }: Props) {
  const t = useTranslations("Employee.ResearchActivity")
  const queryClient = useQueryClient()

  const [raState, setRAState] = useState<ResearchActivityState[]>([])
  useEffect(() => {
    setRAState(researchActivities ? researchActivities.map(v => ({
      ...v,
      employeeID: employeeID,
      editMode: false,
    })) : [])
  }, [])

  const researchActivityQuery = useQuery<EmployeeResearchActivity[], AxiosError<ApiError>, EmployeeResearchActivity[]>({
    queryKey: ["employee-research-activity", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getResearchActivityByEmployeeID(employeeID),
    initialData: researchActivities ?? [],
    refetchOnMount: false,
  })
  useEffect(() => {
    if (researchActivityQuery.data) {
      setRAState([...researchActivityQuery.data.map(v => ({
        ...v,
        employeeID: employeeID,
        editMode: false,
      }))])
    }
  }, [researchActivityQuery.data])

  const addNewRA = () => {
    const ra = raState.find((v) => v.id == 0)
    if (ra) {
      toast.error(t("finishCurrentNewEntry"))
      return
    }
    setRAState([{
      id: 0,
      employeeID: employeeID,
      researchActivityTitle: "",
      employeeRole: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      editMode: true,
    }, ...raState])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deleteWorkExperienceMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deleteResearchActivity,
  })
  const deleteWorkExperience = () => {
    const loadingStateToast = toast.info(t("deleteLoadingToastText"))
    deleteWorkExperienceMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success(t("deleteSuccessToastText"))
        queryClient.invalidateQueries({
          queryKey: ["employee-research-activity", {
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
        <p className="font-bold text-xl">{t("researchActivityLabelText")}</p>
        {isCurrentUserProfile &&
          <div className="cursor-pointer">
            <FaPlus color="blue" onClick={() => addNewRA()} />
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
        {raState.map((activity, index) =>
          !activity.editMode
            ?
            <ResearchActivityDisplay
              key={activity.id}
              researchActivity={activity}
              isCurrentUserProfile={isCurrentUserProfile}
              enableEditMode={() => {
                const ra = raState.map((v, i) => i == index ? { ...v, editMode: true } : v)
                setRAState([...ra])
              }}
              onDeleteClick={() => {
                setIsDeleteDialogOpen(true)
                setToBeDeletedID(activity.id)
              }}
            />
            :
            <ResearchActivityEdit
              key={activity.id}
              researchActivity={activity}
              employeeID={employeeID}
              locale={locale}
              index={index}
              disableEditMode={() => {
                const ra = raState.map((v, i) => i == index ? { ...v, editMode: false } : v)
                setRAState([...ra])
              }}
              removeNewResearchActivityOnCancel={() => {
                const ra = raState.filter((_, i) => i != index)
                setRAState([...ra])
              }}

            />
        )}
      </div>
    </div>
  )
}

interface ResearchActivityDisplayProps {
  researchActivity: EmployeeResearchActivity | undefined
  isCurrentUserProfile: boolean
  enableEditMode: () => void
  onDeleteClick: () => void
}

function ResearchActivityDisplay({
  researchActivity,
  isCurrentUserProfile,
  enableEditMode,
  onDeleteClick,
}: ResearchActivityDisplayProps) {
  if (!researchActivity) return null;
  const t = useTranslations("Employee.ResearchActivity")

  return (
    <div className="flex flex-col space-y-1 border-b-1 py-2">
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <h4 className="font-semibold text-l">{t("displayResearchActivityTitleLabelText")}</h4>
          <p>{researchActivity.researchActivityTitle}</p>
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
        <h4 className="font-semibold text-l">{t("displayEmployeeRoleLabelText")}</h4>
        <p>{researchActivity.employeeRole}</p>
      </div>
    </div>
  )
}

interface ResearchActivityEditProps {
  researchActivity: EmployeeResearchActivity | undefined
  employeeID: number
  index: number
  locale: string
  disableEditMode: () => void
  removeNewResearchActivityOnCancel: () => void
}

function ResearchActivityEdit({
  researchActivity,
  employeeID,
  index,
  locale,
  disableEditMode,
  removeNewResearchActivityOnCancel,
}: ResearchActivityEditProps) {
  if (!researchActivity) return null
  const t = useTranslations("Employee.ResearchActivity")

  const queryClient = useQueryClient()
  const createPIE = useMutation<EmployeeResearchActivity, AxiosError<ApiError>, EmployeeResearchActivity>({
    mutationFn: employeeApi.createResearchActivity,
  })
  const updatePIE = useMutation<EmployeeResearchActivity, AxiosError<ApiError>, EmployeeResearchActivity>({
    mutationFn: employeeApi.updateResearchActivity
  })

  const form = useFormik({
    initialValues: {
      ...researchActivity,
    },
    validationSchema: yup.object({
      researchActivityTitle: yup
        .string()
        .required(t("researchActivityTitleValidationRequiredText")),
      employeeRole: yup
        .string()
        .required(t("employeeRoleValidationRequiredText"))
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
              queryKey: ["employee-research-activity", {
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
            queryKey: ["employee-research-activity", {
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
      removeNewResearchActivityOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_researchActivityTitle`} className="font-semibold">{t("researchActivityTitleLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_researchActivityTitle`}
          name={`researchActivityTitle`}
          value={form.values.researchActivityTitle}
          onChange={form.handleChange}
        />
        {form.errors.researchActivityTitle && form.touched.researchActivityTitle && (
          <div className="text-red-500 font-bold text-sm">{form.errors.researchActivityTitle}</div>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_employeeRole`} className="font-semibold">{t("employeeRoleLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_employeeRole`}
          name={`employeeRole`}
          value={form.values.employeeRole}
          onChange={form.handleChange}
        />
        {form.errors.employeeRole && form.touched.employeeRole && (
          <div className="text-red-500 font-bold text-sm">{form.errors.employeeRole}</div>
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
          onClick={() => onCancelClick(researchActivity.id)}
        >
          {t("cancelButtonText")}
        </button>
      </div>
    </form>
  )
}