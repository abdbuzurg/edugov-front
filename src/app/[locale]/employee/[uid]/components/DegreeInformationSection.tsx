"use client"

import { employeeApi } from "@/api/employee";
import { ApiError } from "@/api/types";
import Dialog from "@/components/Dialog";
import { EmployeeDegree } from "@/types/employee";
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
  degree: EmployeeDegree[] | undefined
  employeeID: number
  locale: string
}

interface DegreeState extends EmployeeDegree {
  editMode: boolean
}

export default function DegreeInformationSection({ degree, employeeID, locale }: Props) {
  const t = useTranslations("Employee.Degree")
  const queryClient = useQueryClient()

  const [degreeState, setDegreeState] = useState<DegreeState[]>([])
  useEffect(() => {
    setDegreeState(degree ? degree.map(v => ({
      ...v,
      dateStart: new Date(v.dateStart),
      dateEnd: new Date(v.dateEnd),
      dateDegreeRecieved: new Date(v.dateDegreeRecieved),
      editMode: false
    })) : [])
  }, [])

  const degreeQuery = useQuery<EmployeeDegree[], Error, EmployeeDegree[]>({
    queryKey: ["employee-degrees", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getDegreesByEmployeeID(employeeID),
    initialData: degree ?? [],
  })
  useEffect(() => {
    if (degreeQuery.data) {
      setDegreeState([...degreeQuery.data.map(v => ({
        ...v,
        dateStart: new Date(v.dateStart),
        dateEnd: new Date(v.dateEnd),
        dateDegreeRecieved: new Date(v.dateDegreeRecieved),
        editMode: false
      }))])
    }
  }, [degreeQuery.data])

  const addNewDegree = () => {
    const degree = degreeState.find(v => v.id == 0)
    if (degree) {
      toast.error(t("finishCurrentNewEntry"))
      return
    }

    setDegreeState([{
      id: 0,
      employeeID: employeeID,
      degreeLevel: "",
      universityName: "",
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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deleteDegreeMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deleteDegree
  })
  const deleteDegree = () => {
    const loadingStateToast = toast.info(t("deleteLoadingToastToast"))
    deleteDegreeMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success(t("deleteSuccessToastText"))
        queryClient.invalidateQueries({
          queryKey: ["employee-degrees", {
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
        <p className="font-bold text-xl">{t("title")}</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewDegree()} />
        </div>
      </div>
      <div className="flex flex-col space-y-1 px-6">
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <h4 className="text-center font-semibold">{t("deletePromptText")}</h4>
          <div className="flex space-x-2 items-center justify-center mt-2">
            <div
              className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
              onClick={() => deleteDegree()}
            >
              {t("deletePromptButtonConfirmText")}
            </div>
            <div
              className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("deletePromptButtonCancelText")}
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
                setToBeDeletedID(degree.id)
              }}
            />
            :
            <DegreeEdit
              key={degree.id}
              degree={degree}
              locale={locale}
              index={index}
              employeeID={employeeID}
              disableEditMode={() => {
                const editModeEnabled = degreeState.map((v, i) => i == index ? { ...v, editMode: false } : v)
                setDegreeState([...editModeEnabled])
              }}
              removeNewDegreeOnCancel={() => {
                const degrees = degreeState.filter((_, i) => i != index)
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
        <p className="font-semibold text-xl">{degree.universityName}</p>
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
  locale: string
  disableEditMode: () => void
  removeNewDegreeOnCancel: () => void
  updateDegreeState: (values: DegreeState) => void
}

function DegreeEdit({ degree, locale, index, employeeID, disableEditMode, removeNewDegreeOnCancel, updateDegreeState }: DegreeEditProps) {
  if (!degree) return null

  const t = useTranslations("Employee.Degree")
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
    validationSchema: yup.object({
      universityName: yup
        .string()
        .required(t("universityNameValidationRequiredText")),
      degreeLevel: yup
        .string()
        .required(t("degreeLevelValidationRequiredText")),
      speciality: yup
        .string()
        .required(t("specialityValidationRequiredText")),
      dateStart: yup
        .date()
        .required(t("dateStartValidationRequiredText"))
        .max(new Date(), t("dateStartValidationMaxText")),
      dateEnd: yup
        .date()
        .required(t("dateEndValidationRequiredText"))
        .max(new Date(), t("dateEndValidationMaxText"))
        .min(yup.ref("dateStart"), t("dateEndValidationMinText")),
      givenBy: yup
        .string()
        .when('degreeLevel', {
          is: (value: any) => highDigreeLevelCheck(value),
          then: (schema) => schema
            .required(t("givenByValidationRequiredText")),
          otherwise: (schema) => schema.optional(),
        }),
      dateDegreeRecieved: yup
        .date()
        .when('degreeLvel', {
          is: (value: any) => highDigreeLevelCheck(value),
          then: (schema) =>
            schema
              .required(t("dateDegreeRecievedValidationRequiredText"))
              .max(new Date(), t("dateDegreeRecievedValidationMaxText")),
          otherwise: (schema) => schema.optional(),
        })
    }),
    onSubmit: values => {
      const mutationVariable: EmployeeDegree = {
        ...values,
        employeeID: employeeID,
        dateDegreeRecieved: highDigreeLevelCheck(values.degreeLevel) ? values.dateDegreeRecieved : values.dateEnd,
        givenBy: highDigreeLevelCheck(values.degreeLevel) ? values.givenBy : values.universityName,
      }
      if (values.id === 0) {
        const loadingStateToast = toast.info(t("createLoadingToastText"))
        createDegreeMutation.mutate(mutationVariable, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success(t("createToastSuccessText"))
            queryClient.invalidateQueries({
              queryKey: ["employee-degrees", {
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
      updateDegreeMutation.mutate(mutationVariable, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success(t("updateSuccessToastText"))
          queryClient.invalidateQueries({
            queryKey: ["employee-degrees", {
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
        <label htmlFor={`${index}_universityName`} className="font-semibold">{t("universityLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_universityName`}
          name="universityName"
          value={form.values.universityName}
          onChange={form.handleChange}
        />
      </div>
      {form.errors.universityName && form.touched.universityName && (
        <div className="text-red-500 font-bold text-sm">{form.errors.universityName}</div>
      )}

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">{t("degreeLabelText")}</label>
        <div className="flex space-x-2">
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_bachelor`}
              value={t("degreeLevelBachelorValueText")}
              onChange={form.handleChange}
              checked={form.values.degreeLevel == t("degreeLevelBachelorValueText")}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_bachelor`}>{t("degreeLevelBachelorValueText")}</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_masters`}
              value={t("degreeLevelMasterValueText")}
              onChange={form.handleChange}
              checked={form.values.degreeLevel == t("degreeLevelMasterValueText")}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_masters`}>{t("degreeLevelMasterValueText")}</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_specialist_level`}
              value={t("degreeLevelSpecialityValueText")}
              onChange={form.handleChange}
              checked={form.values.degreeLevel == t("degreeLevelSpecialityValueText")}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_specialist_level`}>{t("degreeLevelSpecialityValueText")}</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_pre_phd`}
              value={t("degreeLevelCandidateOfScienceText")}
              onChange={form.handleChange}
              checked={form.values.degreeLevel == t("degreeLevelCandidateOfScienceText")}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_pre_phd`}>{t("degreeLevelCandidateOfScienceText")}</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name={`degreeLevel`}
              id={`${index}_degreeLevel_${degree.id}_phd`}
              value={t("degreeLevelPHDText")}
              onChange={form.handleChange}
              checked={form.values.degreeLevel == t("degreeLevelPHDText")}
            />
            <label htmlFor={`${index}_degreeLevel-${degree.id}_phd`}>{t("degreeLevelPHDText")}</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_doctor_of_science`}
              value={t("degreeLevelDoctorOfScience")}
              onChange={form.handleChange}
              checked={form.values.degreeLevel == t("degreeLevelDoctorOfScience")}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_doctor_of_science`}>{t("degreeLevelDoctorOfScience")}</label>
          </div>
        </div>
        {form.errors.degreeLevel && form.touched.degreeLevel && (
          <div className="text-red-500 font-bold text-sm">{form.errors.degreeLevel}</div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor={`degree[${index}.speciality]`}>{t("specialityLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_speciality`}
          name="speciality"
          value={form.values.speciality}
          onChange={form.handleChange}
        />
        {form.errors.speciality && form.touched.speciality && (
          <div className="text-red-500 font-bold text-sm">{form.errors.speciality}</div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">{t("yearsOfStudyText")}</label>
        <div className="flex space-x-2">
          <div className="flex flex-col space-y-1">
            <label>{t("startLabelText")}</label>
            <input
              type="date"
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              id={`${index}_dateStart`}
              name="dateStart"
              value={form.values.dateStart.toISOString().slice(0, 10)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
            />
            {form.errors.dateStart && form.touched.dateStart && (
              // @ts-ignore
              <div className="text-red-500 font-bold text-sm">{form.errors.dateStart}</div>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <label>{t("endLabelText")}</label>
            <input
              type="date"
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              id={`${index}_dateEnd`}
              name="dateEnd"
              value={form.values.dateEnd.toISOString().slice(0, 10)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
            />
            {form.errors.dateStart && form.touched.dateStart && (
              // @ts-ignore
              <div className="text-red-500 font-bold text-sm">{form.errors.dateStart}</div>
            )}
          </div>
        </div>
      </div>

      {highDigreeLevelCheck(form.values.degreeLevel) && (
        <div className="flex space-x-2">
          <div className="flex flex-col space-y-1">
            <label htmlFor={`degree[${index}.givenBy]`}>{t("givenByLabelText")}</label>
            <input
              type="text"
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              id={`${index}_givenBy`}
              name="givenBy"
              value={form.values.givenBy}
              onChange={form.handleChange}
            />
            {form.errors.givenBy && form.touched.givenBy && (
              <div className="text-red-500 font-bold text-sm">{form.errors.givenBy}</div>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <label>{t("dateDegreeRecievedLabelText")}</label>
            <input
              type="date"
              className="border p-2 rounded-xl border-gray-400 bg-gray-300"
              id={`${index}_dateDegreeRecieved`}
              name="dateDegreeRecieved"
              value={form.values.dateDegreeRecieved.toISOString().slice(0, 10)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onDateChange(e)}
            />
            {form.errors.dateDegreeRecieved && form.touched.dateDegreeRecieved && (
              //@ts-ignore
              <div className="text-red-500 font-bold text-sm">{form.errors.dateDegreeRecieved}</div>
            )}
          </div>
        </div>
      )}
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
          onClick={() => onCancelClick(degree.id)}
        >
          {t("cancelButtonText")}
        </button>
      </div>

    </form>
  )
}


