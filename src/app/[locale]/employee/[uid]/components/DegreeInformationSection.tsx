"use client"

import { employeeApi } from "@/api/employee";
import { ApiError } from "@/api/types";
import DatePickerSelect, { SelectedDate } from "@/components/DatePicker";
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
import { ammitData, belarusUniversityNames, kazokUniversityNames, uzbUniversityNames } from "./universityName";
import { bachelorsSpeciality, doctorSpecialties, listOfGovermentalInstitution, ordinaturaLines, phdSpecialities } from "./degreeName";

interface Props {
  degree: EmployeeDegree[] | undefined
  employeeID: number
  locale: string
  isCurrentUserProfile: boolean
}

interface DegreeState extends EmployeeDegree {
  editMode: boolean
}

export default function DegreeInformationSection({ degree, employeeID, locale, isCurrentUserProfile }: Props) {
  const t = useTranslations("Employee.Degree")
  const queryClient = useQueryClient()

  const [degreeState, setDegreeState] = useState<DegreeState[]>([])
  useEffect(() => {
    setDegreeState(degree ? degree.map(v => ({
      ...v,
      dateStart: v.dateStart ? new Date(v.dateStart) : null,
      dateEnd: v.dateEnd ? new Date(v.dateEnd) : null,
      dateDegreeRecieved: v.dateDegreeRecieved ? new Date(v.dateDegreeRecieved) : null,
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
    refetchOnMount: false,
  })
  useEffect(() => {
    if (degreeQuery.data) {
      setDegreeState([...degreeQuery.data.map(v => ({
        ...v,
        dateStart: v.dateStart ? new Date(v.dateStart) : null,
        dateEnd: v.dateEnd ? new Date(v.dateEnd) : null,
        dateDegreeRecieved: v.dateDegreeRecieved ? new Date(v.dateDegreeRecieved) : null,
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
      dateStart: null,
      dateEnd: null,
      givenBy: "",
      dateDegreeRecieved: null,
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
        {isCurrentUserProfile &&
          <div className="cursor-pointer">
            <FaPlus color="blue" onClick={() => addNewDegree()} />
          </div>
        }
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
              isCurrentUserProfile={isCurrentUserProfile}
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
  isCurrentUserProfile: boolean
  enableEditMode: () => void
  onDeleteClick: () => void
}

function DegreeDisplay({ degree, enableEditMode, onDeleteClick, isCurrentUserProfile }: DegreeDisplayProps) {
  if (!degree) return null
  if (!degree.dateStart) return null
  if (!degree.dateEnd) return null

  return (
    <div className="flex flex-col space-y-1  border-b-1 pb-2">
      <div className="flex justify-between items-center border-gray-500">
        <p className="font-semibold text-xl">{degree.universityName}</p>
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

  const [dateStart, setDateStart] = useState<SelectedDate>({
    day: degree.dateStart?.getDate() ?? 0,
    month: degree.dateStart ? degree.dateStart.getMonth() + 1 : 0,
    year: degree.dateStart?.getFullYear() ?? 0,
  })
  useEffect(() => {
    if (dateStart.day != 0 && dateStart.month != 0 && dateStart.year != 0) {
      form.setFieldValue("dateStart", new Date(Date.UTC(dateStart.year, dateStart.month - 1, dateStart.day)))
    }
  }, [dateStart])

  const [dateEnd, setDateEnd] = useState<SelectedDate>({
    day: degree.dateEnd?.getDate() ?? 0,
    month: degree.dateEnd ? degree.dateEnd.getMonth() + 1 : 0,
    year: degree.dateEnd?.getFullYear() ?? 0,
  })
  useEffect(() => {
    if (dateEnd.day != 0 && dateEnd.month != 0 && dateEnd.year != 0) {
      form.setFieldValue("dateEnd", new Date(Date.UTC(dateEnd.year, dateEnd.month - 1, dateEnd.day)))
    }
  }, [dateEnd])

  const [dateDegreeRecieved, setDateDegreeRecieved] = useState<SelectedDate>({
    day: degree.dateDegreeRecieved?.getDate() ?? 0,
    month: degree.dateDegreeRecieved ? degree.dateDegreeRecieved.getMonth() + 1 : 0,
    year: degree.dateDegreeRecieved?.getFullYear() ?? 0,
  })
  useEffect(() => {
    if (dateDegreeRecieved.day != 0 && dateDegreeRecieved.month != 0 && dateDegreeRecieved.year != 0) {
      form.setFieldValue("dateDegreeRecieved", new Date(Date.UTC(dateDegreeRecieved.year, dateDegreeRecieved.month - 1, dateDegreeRecieved.day)))
    }
  }, [dateDegreeRecieved])

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
          is: (value: string) => highDigreeLevelCheck(value),
          then: (schema) => schema
            .required(t("givenByValidationRequiredText")),
          otherwise: (schema) => schema.optional(),
        }),
      dateDegreeRecieved: yup
        .date()
        .nullable()
        .when('degreeLevel', {
          is: (value: string) => highDigreeLevelCheck(value),
          then: (schema) =>
            schema
              .required(t("dateDegreeRecievedValidationRequiredText"))
              .max(new Date(), t("dateDegreeRecievedValidationMaxText"))
              .min(yup.ref('dateStart'), t("dateDegreeRecievedValidationMinText")),
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

  const highDigreeLevelCheck = (degreeLevel: string): boolean => {
    return degreeLevel == t("degreeLevelCandidateOfScienceText")
      || degreeLevel == t("degreeLevelPHDText")
      || degreeLevel == t("degreeLevelDoctorOfScience")
  }

  const onCancelClick = (id: number) => {
    if (id === 0) {
      removeNewDegreeOnCancel()
      return
    }

    disableEditMode()
  }

  const handleDegreeLevelChange = (value: string) => {
    form.setFieldValue("degreeLevel", value)
    switch (value) {
      case t("degreeLevelBachelorValueText"):
        setSpecialityList(bachelorsSpeciality)
        break

      case t("degreeLevelMasterValueText"):
        setSpecialityList(bachelorsSpeciality)
        break

      case t("degreeLevelSpecialityValueText"):
        setSpecialityList(bachelorsSpeciality)
        break

      case t("degreeLevelResidencyText"):
        setSpecialityList(ordinaturaLines)
        break

      case t("degreeLevelCandidateOfScienceText"):
        setSpecialityList(doctorSpecialties)
        break

      case t("degreeLevelPHDText"):
        setSpecialityList(phdSpecialities)
        break

      case t("degreeLevelDoctorOfScience"):
        setSpecialityList(doctorSpecialties)
        break
    }
  }

  const [institutionNames, setInstitutionNames] = useState<string[]>([
    ...ammitData,
    ...uzbUniversityNames,
    ...kazokUniversityNames,
    ...belarusUniversityNames,
  ])
  const institutionNamesQuery = useQuery<string[], Error, string[]>({
    queryKey: ["institution-names", locale],
    queryFn: () => employeeApi.getInstitutionNames()
  })
  useEffect(() => {
    if (institutionNamesQuery.data && institutionNamesQuery.isSuccess) {
      setInstitutionNames((prev) => [...prev, ...institutionNamesQuery.data])
    }
  }, [institutionNamesQuery.data])
  const [selectedInstitutionNameQuery, setSelectedInstitutionNameQuery] = useState(degree.universityName)
  const [showInstitutionNames, setShowInstitutionNames] = useState(false)
  const [filteredInstitutionNames, setFilteredInstitutionNames] = useState<string[]>([])

  const handleInstitutionNameSearch = (value: string) => {
    setSelectedInstitutionNameQuery(value);

    if (value.trim()) {
      const filtered = institutionNames
        .filter(c => c.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10);
      setFilteredInstitutionNames(filtered);
      setShowInstitutionNames(true);
    } else {
      setFilteredInstitutionNames([]);
      setShowInstitutionNames(false);
    }
  }

  const selectInstitutionName = (institutionName: string) => {
    if (institutionNames.includes(institutionName)) {
      setSelectedInstitutionNameQuery(institutionName);
      form.setFieldValue('universityName', institutionName)
    }
    setShowInstitutionNames(false);
  };

  const [specialityList, setSpecialityList] = useState<string[]>([])
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>(degree.speciality)
  const [showSpecialities, setShowSpecialities] = useState(false)
  const [filteredSpecialities, setFilteredSpecialities] = useState<string[]>([])

  const handleSpecialitySearch = (value: string) => {
    setSelectedSpeciality(value);

    if (value.trim()) {
      const filtered = specialityList
        .filter(c => c.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10);
      setFilteredSpecialities(filtered);
      setShowSpecialities(true);
    } else {
      setFilteredSpecialities([]);
      setShowSpecialities(false);
    }
  }

  const selectSpeciality = (speciality: string) => {
    if (specialityList.includes(speciality)) {
      setSelectedSpeciality(speciality);
      form.setFieldValue('speciality', speciality)
    }
    setShowInstitutionNames(false);
  };

  const [governmentalInstitutionList, setGovernmentalInstitutionList] = useState<string[]>(listOfGovermentalInstitution)
  const [selectedGovernmentalInstitution, setSelectedGovernmentalInstitution] = useState<string>(degree.givenBy)
  const [showGovernmentalList, setShowGovernmentalList] = useState(false)
  const [filteredGovernmentalList, setFilteredGovernmentalList] = useState<string[]>([])

  const handleGovernmentalInstitutionSearch = (value: string) => {
    setSelectedGovernmentalInstitution(value);

    if (value.trim()) {
      const filtered = governmentalInstitutionList
        .filter(c => c.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10);
      setFilteredGovernmentalList(filtered);
      setShowGovernmentalList(true);
    } else {
      setFilteredGovernmentalList([]);
      setShowGovernmentalList(false);
    }
  }

  const selectGovernmentalInstitution = (governmentalInstitution: string) => {
    if (governmentalInstitutionList.includes(governmentalInstitution)) {
      setSelectedGovernmentalInstitution(governmentalInstitution);
      form.setFieldValue('givenBy', governmentalInstitution)
    }
    setShowGovernmentalList(false);
  };

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="relative">
        <div className="flex flex-col space-y-1">
          <label htmlFor={`${index}_universityName`} className="font-semibold">{t("universityLabelText")}</label>
          <input
            type="text"
            className="border p-2 rounded-xl border-gray-400 bg-gray-300"
            id={`${index}_universityName`}
            name="universityName"
            value={selectedInstitutionNameQuery}
            onChange={(e) => handleInstitutionNameSearch(e.target.value)}
            onFocus={() => {
              if (selectedInstitutionNameQuery.trim()) {
                const filtered = institutionNames
                  .filter(c => c.toLowerCase().includes(selectedInstitutionNameQuery.toLowerCase()))
                  .slice(0, 10);
                setFilteredInstitutionNames(filtered);
                setShowInstitutionNames(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowInstitutionNames(false), 200)}
          />
        </div>
        {form.errors.universityName && form.touched.universityName && (
          <div className="text-red-500 font-bold text-sm">{form.errors.universityName}</div>
        )}
        {showInstitutionNames && filteredInstitutionNames.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filteredInstitutionNames.map((institutionName, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectInstitutionName(institutionName)}
                className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
              >
                {institutionName}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">{t("degreeLabelText")}</label>
        <div className="flex gap-x-4 gap-y-2 flex-wrap">
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_bachelor`}
              value={t("degreeLevelBachelorValueText")}
              onChange={(e) => handleDegreeLevelChange(e.target.value)}
              checked={form.values.degreeLevel == t("degreeLevelBachelorValueText")}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_bachelor`}>{t("degreeLevelBachelorValueText")}</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_specialist_level`}
              value={t("degreeLevelSpecialityValueText")}
              onChange={(e) => handleDegreeLevelChange(e.target.value)}
              checked={form.values.degreeLevel == t("degreeLevelSpecialityValueText")}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_specialist_level`}>{t("degreeLevelSpecialityValueText")}</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_masters`}
              value={t("degreeLevelMasterValueText")}
              onChange={(e) => handleDegreeLevelChange(e.target.value)}
              checked={form.values.degreeLevel == t("degreeLevelMasterValueText")}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_masters`}>{t("degreeLevelMasterValueText")}</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_internship`}
              value={t("degreeLevelIntershipText")}
              onChange={(e) => handleDegreeLevelChange(e.target.value)}
              checked={form.values.degreeLevel == t("degreeLevelIntershipText")}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_internship`}>{t("degreeLevelIntershipText")}</label>
          </div>
          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_residency`}
              value={t("degreeLevelResidencyText")}
              onChange={(e) => handleDegreeLevelChange(e.target.value)}
              checked={form.values.degreeLevel == t("degreeLevelResidencyText")}
            />
            <label htmlFor={`${index}_degreeLevel_${degree.id}_residency`}>{t("degreeLevelResidencyText")}</label>
          </div>

          <div className="flex space-x-1 items-center">
            <input
              type="radio"
              name="degreeLevel"
              id={`${index}_degreeLevel_${degree.id}_pre_phd`}
              value={t("degreeLevelCandidateOfScienceText")}
              onChange={(e) => handleDegreeLevelChange(e.target.value)}
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
              onChange={(e) => handleDegreeLevelChange(e.target.value)}
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
              onChange={(e) => handleDegreeLevelChange(e.target.value)}
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

        <div className="relative w-full">
          <input
            type="text"
            className="border p-2 rounded-xl border-gray-400 bg-gray-300 w-full"
            id={`${index}_speciality`}
            name="speciality"
            value={selectedSpeciality}
            onChange={(e) => handleSpecialitySearch(e.target.value)}
            onFocus={() => {
              if (selectedSpeciality.trim()) {
                const filtered = specialityList
                  .filter(c => c.toLowerCase().includes(selectedSpeciality.toLowerCase()))
                  .slice(0, 10);
                setFilteredSpecialities(filtered);
                setShowSpecialities(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowSpecialities(false), 200)}
          />
          {form.errors.speciality && form.touched.speciality && (
            <div className="text-red-500 font-bold text-sm">{form.errors.speciality}</div>
          )}
          {showSpecialities && filteredSpecialities.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredSpecialities.map((speciality, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSpeciality(speciality)}
                  className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                >
                  {speciality}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">{t("yearsOfStudyText")}</label>
        <div className="flex space-x-10">
          <div className="flex-1 flex flex-col space-y-1">
            <label>{t("startLabelText")}</label>
            <DatePickerSelect
              date={dateStart}
              onDateChange={setDateStart}
            />
            {form.errors.dateStart && form.touched.dateStart && (
              // @ts-ignore
              <div className="text-red-500 font-bold text-sm">{form.errors.dateStart}</div>
            )}
          </div>
          <div className="flex-1 flex flex-col space-y-1">
            <label>{t("endLabelText")}</label>
            <DatePickerSelect
              date={dateEnd}
              onDateChange={setDateEnd}
            />
            {form.errors.dateEnd && form.touched.dateEnd && (
              // @ts-ignore
              <div className="text-red-500 font-bold text-sm">{form.errors.dateEnd}</div>
            )}
          </div>
        </div>
      </div>

      {highDigreeLevelCheck(form.values.degreeLevel) && (
        <div className="flex space-x-10">
          <div className="flex-1 flex flex-col space-y-1 w-full">
            <label htmlFor={`degree[${index}.givenBy]`}>{t("givenByLabelText")}</label>
            <div className="relative w-full">
              <input
                type="text"
                className="border p-2 rounded-xl border-gray-400 bg-gray-300 w-full"
                id={`${index}_givenBy`}
                name="givenBy"
                value={selectedGovernmentalInstitution}
                onChange={(e) => handleGovernmentalInstitutionSearch(e.target.value)}
                onFocus={() => {
                  if (selectedGovernmentalInstitution.trim()) {
                    const filtered = governmentalInstitutionList
                      .filter(c => c.toLowerCase().includes(selectedGovernmentalInstitution.toLowerCase()))
                      .slice(0, 10);
                    setFilteredGovernmentalList(filtered);
                    setShowGovernmentalList(true);
                  }
                }}
              />
              {form.errors.givenBy && form.touched.givenBy && (
                <div className="text-red-500 font-bold text-sm">{form.errors.givenBy}</div>
              )}
              {showGovernmentalList && filteredGovernmentalList.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filteredGovernmentalList.map((governmentalInstitution, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectGovernmentalInstitution(governmentalInstitution)}
                      className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {governmentalInstitution}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col space-y-1">
            <label>{t("dateDegreeRecievedLabelText")}</label>
            <DatePickerSelect
              date={dateDegreeRecieved}
              onDateChange={setDateDegreeRecieved}
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

