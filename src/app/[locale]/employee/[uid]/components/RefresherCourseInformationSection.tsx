"use client"

import { employeeApi } from "@/api/employee"
import { ApiError } from "@/api/types"
import Dialog from "@/components/Dialog"
import { EmployeeRefresherCourse } from "@/types/employee"
import formatDate from "@/utils/dateFormatter"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import { ChangeEvent, FormEvent, Fragment, useEffect, useState } from "react"
import { FaPen, FaPlus, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import { useTranslations } from "use-intl"
import * as yup from "yup"

interface Props {
  refresherCourses: EmployeeRefresherCourse[] | undefined
  locale: string
  isCurrentUserProfile: boolean
  employeeID: number
}

interface RefresherCourseState extends EmployeeRefresherCourse {
  editMode: boolean
}

export default function RefresherCourseInformationSection({
  refresherCourses,
  locale,
  isCurrentUserProfile,
  employeeID,
}: Props) {
  const t = useTranslations("Employee.RefresherCourse")
  const queryClient = useQueryClient()
  const [refresherCourseState, setRefresherCourseState] = useState<RefresherCourseState[]>([])
  useEffect(() => {
    setRefresherCourseState(refresherCourses ? refresherCourses.map(v => ({
      ...v,
      dateStart: new Date(v.dateStart),
      dateEnd: new Date(v.dateEnd),
      editMode: false,
    })) : [])
  }, [])

  const refresherCourseQuery = useQuery<EmployeeRefresherCourse[], AxiosError<ApiError>, EmployeeRefresherCourse[]>({
    queryKey: ["employee-refresher-course", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getRefresheerCoursesByEmployeeID(employeeID),
    initialData: refresherCourses,
    refetchOnMount: false,
  })
  useEffect(() => {
    if (refresherCourseQuery.data) {
      setRefresherCourseState(refresherCourseQuery.data.map(v => ({
        ...v,
        dateStart: new Date(v.dateStart),
        dateEnd: new Date(v.dateEnd),
        editMode: false,
      })))
    }
  }, [refresherCourseQuery.data])

  const addNewRefresherCourse = () => {
    const newRefresherCourse = refresherCourseState.find(v => v.id === 0)
    if (newRefresherCourse) {
      toast.info(t("finishCurrentNewEntry"))
      return
    }

    setRefresherCourseState([{
      id: 0,
      employeeID: employeeID,
      courseTitle: "",
      dateStart: new Date(),
      dateEnd: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      editMode: true,
    }, ...refresherCourseState])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deleteRefresherCourseMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deleteRefresherCourse
  })
  const deleteRefresherCourse = () => {
    const loadingStateToast = toast.info(t("deleteLoadingToastText"))
    deleteRefresherCourseMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success(t("deleteSuccessToastText"))
        queryClient.invalidateQueries({
          queryKey: ["employee-refresher-course", {
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
        <p className="font-bold text-xl">{t("refresherCourseLabelText")}</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewRefresherCourse()} />
        </div>
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
              onClick={() => deleteRefresherCourse()}
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
        {refresherCourseState.map((course, index) => (
          <Fragment key={index}>
            {!course.editMode
              ?
              <RefresherCourseDisplay
                key={course.id}
                refresherCourse={course}
                isCurrentUserProfile={isCurrentUserProfile}
                enableEditMode={() => {
                  const rf = refresherCourseState.map((v, i) => i == index ? { ...v, editMode: true } : v)
                  setRefresherCourseState(rf)
                }}
                onDeleteClick={() => {
                  setIsDeleteDialogOpen(true)
                  setToBeDeletedID(course.id)
                }}
              />
              :
              <RefresherCourseEdit
                key={course.id}
                refresherCourse={course}
                employeeID={employeeID}
                locale={locale}
                index={index}
                disableEditMode={() => {
                  const rc = refresherCourseState.map((v, i) => i == index ? { ...v, editMode: false } : v)
                  setRefresherCourseState([...rc])
                }}
                removeNewRefresherCourseOnCancel={() => {
                  const rc = refresherCourseState.filter((_, i) => i != index)
                  setRefresherCourseState([...rc])
                }}
              />
            }

          </Fragment>
        ))}
      </div>

    </div>
  )
}

interface RefresherCourseDisplayProps {
  refresherCourse: EmployeeRefresherCourse | null
  isCurrentUserProfile: boolean
  enableEditMode: () => void
  onDeleteClick: () => void
}

function RefresherCourseDisplay({
  refresherCourse,
  isCurrentUserProfile,
  enableEditMode,
  onDeleteClick,
}: RefresherCourseDisplayProps) {
  if (!refresherCourse) return null
  const t = useTranslations("Employee.RefresherCourse")

  return (
    <div className="flex flex-col space-y-1 border-b-1 py-2">
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <h4 className="font-semibold text-l">{t("courseTitleDisplaLabelText")}</h4>
          <p>{refresherCourse.courseTitle}</p>
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
        <h4 className="font-semibold text-l">{t("periodTitleDisplayLabelText")}</h4>
        <p>{formatDate(refresherCourse.dateStart)} - {formatDate(refresherCourse.dateEnd)}</p>
      </div>
    </div>
  )
}

interface RefresherCourseEditProps {
  refresherCourse: EmployeeRefresherCourse | undefined
  employeeID: number
  index: number
  locale: string
  disableEditMode: () => void
  removeNewRefresherCourseOnCancel: () => void
}

function RefresherCourseEdit({
  refresherCourse,
  employeeID,
  index,
  locale,
  disableEditMode,
  removeNewRefresherCourseOnCancel,
}: RefresherCourseEditProps) {
  if (!refresherCourse) return null

  const t = useTranslations("Employee.RefresherCourse")
  const queryClient = useQueryClient()
  const createRefresherCourseMutation = useMutation<EmployeeRefresherCourse, AxiosError<ApiError>, EmployeeRefresherCourse>({
    mutationFn: employeeApi.createRefresherCourse
  })
  const updateRefresherCourseMutation = useMutation<EmployeeRefresherCourse, AxiosError<ApiError>, EmployeeRefresherCourse>({
    mutationFn: employeeApi.updateRefresherCourse
  })

  const form = useFormik({
    initialValues: {
      ...refresherCourse,
    },
    validationSchema: yup.object({
      courseTitle: yup
        .string()
        .required(t("courseTitleValidationRequiredText")),
      dateStart: yup
        .date()
        .required(t("dateStartValidationRequiredText"))
        .max(new Date(), t("dateStartValidationMaxText")),
      dateEnd: yup
        .date()
        .required(t("dateEndValidationRequiredText"))
        .max(new Date(), t("dateEndValidationMaxText"))
        .min(yup.ref('dateStart'), t("dateEndValidationMinText"))
    }),
    onSubmit: (values) => {
      if (values.id === 0) {
        console.log("kek")
        const loadingStateToast = toast.info(t("createLoadingToastText"))
        createRefresherCourseMutation.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success(t("createSuccessToastText"))
            queryClient.invalidateQueries({
              queryKey: ["employee-refresher-course", {
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
      updateRefresherCourseMutation.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success(t("updateSuccessToastText"))
          queryClient.invalidateQueries({
            queryKey: ["employee-refresher-course", {
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
      removeNewRefresherCourseOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`[${index}]_courseTitle`} className="font-semibold">{t("courseTitleLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`[${index}]_courseTitle`}
          name={`courseTitle`}
          value={form.values.courseTitle}
          onChange={form.handleChange}
        />
        {form.errors.courseTitle && form.touched.courseTitle && (
          //@ts-ignore
          <div className="text-red-500 font-bold text-sm">{form.errors.courseTitle}</div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">{t("periodLabelText")}</label>
        <div className="flex space-x-2">
          <div className="flex flex-col space-y-1">
            <label htmlFor={`${index}_dateStart`}>{t("dateStartLabelText")}</label>
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
            <label htmlFor={`${index}_dateEnd`}>{t("dateEndLabelText")}</label>
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
          onClick={() => onCancelClick(refresherCourse.id)}
        >
          {t("cancelButtonText")}
        </button>
      </div>
    </form>
  )
}