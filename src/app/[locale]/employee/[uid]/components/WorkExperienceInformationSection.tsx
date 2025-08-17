"use client"

import { employeeApi } from "@/api/employee";
import { ApiError } from "@/api/types";
import DatePickerSelect, { SelectedDate } from "@/components/DatePicker";
import Dialog from "@/components/Dialog";
import { EmployeeWorkExperience } from "@/types/employee";
import formatDate from "@/utils/dateFormatter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import * as yup from "yup"

interface Props {
  workExperience: EmployeeWorkExperience[] | undefined
  employeeID: number
  locale: string
  isCurrentUserProfile: boolean
}

interface WorkExperienceState extends EmployeeWorkExperience {
  editMode: boolean
}

export default function WorkExperienceInformationSection({ workExperience, employeeID, locale, isCurrentUserProfile }: Props) {
  const t = useTranslations("Employee.WorkExperience")
  const queryClient = useQueryClient()

  const [workExperienceState, setWorkExperienceState] = useState<WorkExperienceState[]>([])
  useEffect(() => {
    setWorkExperienceState(workExperience ? workExperience.map(v => ({
      ...v,
      dateEnd: v.dateEnd ? new Date(v.dateEnd) : null,
      dateStart: v.dateStart ? new Date(v.dateStart) : null,
      employeeID: employeeID,
      editMode: false,
    })) : [])
  }, [])

  const workExperienceQuery = useQuery<EmployeeWorkExperience[], AxiosError<ApiError>, EmployeeWorkExperience[]>({
    queryKey: ["employee-work-experience", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getWorkExperienceByEmployeeID(employeeID),
    initialData: workExperience ?? [],
    refetchOnMount: false,
  })
  useEffect(() => {
    if (workExperienceQuery.data) {
      setWorkExperienceState([...workExperienceQuery.data.map(v => ({
        ...v,
        dateEnd: v.dateEnd ? new Date(v.dateEnd) : null,
        dateStart: v.dateStart ? new Date(v.dateStart) : null,
        employeeID: employeeID,
        editMode: false,
      }))])
    }
  }, [workExperienceQuery.data])

  const addNewWorkExperience = () => {
    const workExperience = workExperienceState.find((v) => v.id == 0)
    if (workExperience) {
      toast.error(t("finishCurrentNewEntry"))
      return
    }
    setWorkExperienceState([{
      id: 0,
      employeeID: employeeID,
      workplace: "",
      jobTitle: "",
      description: "",
      dateStart: null,
      dateEnd: null,
      ongoing: false,
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
    const loadingStateToast = toast.info(t("deleteLoadingToastText"))
    deleteWorkExperienceMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success(t("deleteSuccessToastText"))
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
        <p className="font-bold text-xl">{t("workExperienceLabelText")}</p>
        {isCurrentUserProfile &&
          <div className="cursor-pointer">
            <FaPlus color="blue" onClick={() => addNewWorkExperience()} />
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
        {workExperienceState.map((experience, index) =>
          !experience.editMode
            ?
            <WorkExperienceDisplay
              key={experience.id}
              workExperience={experience}
              isCurrentUserProfile={isCurrentUserProfile}
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
  isCurrentUserProfile: boolean
  enableEditMode: () => void
  onDeleteClick: () => void
}

function WorkExperienceDisplay({ workExperience, enableEditMode, onDeleteClick, isCurrentUserProfile }: WorkExperienceDisplayProps) {
  if (!workExperience) return null
  if (!workExperience.dateStart) return null
  if (!workExperience.dateEnd) return null
  const t = useTranslations("Employee.WorkExperience")

  return (
    <div className="flex flex-col space-y-1  border-b-1 pb-2">
      <div className="flex justify-between items-center border-gray-500">
        <p className="font-semibold text-xl">{workExperience.workplace}</p>
        {isCurrentUserProfile &&
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
        }
      </div>
      <div>
        <h5>{workExperience.jobTitle}</h5>
        <div className="flex space-x-2">
          <h4>{formatDate(workExperience.dateStart)} - {!workExperience.ongoing ? formatDate(workExperience.dateEnd) : t("currentWorkplace")}</h4>
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
  const t = useTranslations("Employee.WorkExperience")

  const queryClient = useQueryClient()
  const createWorkExperience = useMutation<EmployeeWorkExperience, AxiosError<ApiError>, EmployeeWorkExperience>({
    mutationFn: employeeApi.createWorkExperience,
  })

  const updateWorkExperienceMutation = useMutation<EmployeeWorkExperience, AxiosError<ApiError>, EmployeeWorkExperience>({
    mutationFn: employeeApi.updateWorkExperience,
  })

  const [dateStart, setDateStart] = useState<SelectedDate>({
    day: workExperience.dateStart?.getDate() ?? 0,
    month: workExperience.dateStart ? workExperience.dateStart.getMonth() + 1 : 0,
    year: workExperience.dateStart?.getFullYear() ?? 0,
  })
  useEffect(() => {
    if (dateStart.day != 0 && dateStart.month != 0 && dateStart.year != 0) {
      form.setFieldValue("dateStart", new Date(Date.UTC(dateStart.year, dateStart.month - 1, dateStart.day)))
    }
  }, [dateStart])

  const [dateEnd, setDateEnd] = useState<SelectedDate>({
    day: workExperience.dateEnd?.getDate() ?? 0,
    month: workExperience.dateEnd ? workExperience.dateEnd.getMonth() + 1 : 0,
    year: workExperience.dateEnd?.getFullYear() ?? 0,
  })
  useEffect(() => {
    if (dateEnd.day != 0 && dateEnd.month != 0 && dateEnd.year != 0) {
      form.setFieldValue("dateEnd", new Date(Date.UTC(dateEnd.year, dateEnd.month - 1, dateStart.day)))
    }
  }, [dateEnd])

  const form = useFormik({
    initialValues: {
      ...workExperience,
    },
    validationSchema: yup.object({
      workplace: yup
        .string()
        .required(t("workPlaceValidationRequiredText")),
      jobTitle: yup
        .string()
        .required(t("jobTitleValidationRequiredText")),
      description: yup
        .string()
        .required(t("descriptionValidationRequiredText")),
      dateStart: yup
        .date()
        .required(t("dateStartValidationRequiredText"))
        .max(new Date(), t("dateStartValidationMaxText")),
      dateEnd: yup
        .date()
        .nullable()
        .when('ongoing', {
          is: false,
          then: (schema) => schema
            .required(t("dateEndValidationRequiredText"))
            .max(new Date(), t("dateEndValidationMaxText"))
            .min(yup.ref('dateStart'), t("dateEndValidationMinText")),
          otherwise: (schema) => schema.optional(),
        })
    }),
    onSubmit: values => {
      if (values.id === 0) {
        const loadingStateToast = toast.info(t("createLoadingToastText"))
        createWorkExperience.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success(t("createSuccessToastText"))
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
              toast.error(`${t("createErrorToastText")} - ${error.response.data.message}`)
            } else {
              toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
            }
          }
        })
        return
      }

      const loadingStateToast = toast.info(t("updateLoadingToastText"))
      updateWorkExperienceMutation.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success(t("updateSuccessToastText"))
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
      removeNewWorkExperienceOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_workplace]`} className="font-semibold">{t("workPlaceLabelText")}</label>
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
        <label htmlFor={`${index}_workplace]`} className="font-semibold">{t("jobTitleLabelText")}</label>
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
        <label className="font-semibold">{t("periodTextLabelText")}</label>
        <div className="flex gap-x-10 items-center">
          <div className="flex-1 flex flex-col gap-y-0.5">
            <label>{t("dateStartLabelText")}</label>
            <DatePickerSelect
              date={dateStart}
              onDateChange={setDateStart}
            />
            {form.errors.dateStart && form.touched.dateStart &&
              <div className="text-red-500 font-bold text-sm">{form.errors.dateStart}</div>
            }
          </div>
          <div className="flex-1 flex flex-col gap-y-0.5">
            <label>{t("dateEndLabelText")}</label>
            <DatePickerSelect
              date={dateEnd}
              onDateChange={setDateEnd}
              isDisabled={form.values.ongoing}
            />
            {form.errors.dateEnd && form.touched.dateEnd &&
              <div className="text-red-500 font-bold text-sm">{form.errors.dateEnd}</div>
            }
          </div>
          <div className="flex flex-col gap-y-0.5">
            <label className="invisible">kek</label>
            <div className="flex gap-x-1 items-center">
              <input type="checkbox" name="ongoing" className="w-5 h-5" checked={form.values.ongoing} onChange={() => {
                setDateEnd({ day: 0, month: 0, year: 0 })
                form.setFieldValue("ongoing", !form.values.ongoing)
              }} />
              <label>{t("currentWorkplace")}</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_description]`} className="font-semibold">{t("descriptionLabelText")}</label>
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
          {t("saveButtonText")}
        </button>
        <button
          type="button"
          className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
          onClick={() => onCancelClick(workExperience.id)}
        >
          {t("cancelButtonText")}
        </button>
      </div>
    </form>
  )
}
