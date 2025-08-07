"use client"

import { employeeApi } from "@/api/employee"
import { ApiError } from "@/api/types"
import Dialog from "@/components/Dialog"
import { EmployeeMainResearchArea } from "@/types/employee"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import {  useEffect, useState } from "react"
import { FaPen, FaPlus, FaPlusCircle, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import { useTranslations } from "use-intl"
import * as yup from "yup"

interface Props {
  mainResearchAreas: EmployeeMainResearchArea[] | undefined
  locale: string
  isCurrentUserProfile: boolean
  employeeID: number
}

interface MRAState extends EmployeeMainResearchArea {
  editMode: boolean
}

export default function MainResearchAreaInformationSection({
  mainResearchAreas,
  locale,
  isCurrentUserProfile,
  employeeID,
}: Props) {
  const t = useTranslations("Employee.MRA")
  const queryClient = useQueryClient()
  const [mraState, setMRAState] = useState<MRAState[]>([])
  useEffect(() => {
    setMRAState(mainResearchAreas ? mainResearchAreas.map(v => ({
      ...v,
      editMode: false,
    })) : [])
  }, [])

  const mraQuery = useQuery<EmployeeMainResearchArea[], AxiosError<ApiError>, EmployeeMainResearchArea[]>({
    queryKey: ["employee-main-research-area", {
      employeeID: employeeID,
      locale: locale,
    }],
    queryFn: () => employeeApi.getMRAEmployeeID(employeeID),
    initialData: mainResearchAreas ?? [],
    refetchOnMount: false,
  })
  useEffect(() => {
    if (mraQuery.data) {
      setMRAState([...mraQuery.data.map(v => ({
        ...v,
        editMode: false,
      }))])
    }
  }, [mraQuery.data])

  const addNewMRA = () => {
    const mra = mraState.find(v => v.id === 0)
    if (mra) {
      toast.info(t("finishCurrentNewEntry"))
      return
    }

    setMRAState([{
      id: 0,
      employeeID: employeeID,
      discipline: "",
      area: "",
      keyTopics: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      editMode: true,
    }, ...mraState])
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toBeDeletedID, setToBeDeletedID] = useState(-1)
  const deleteMRAMutation = useMutation<void, AxiosError<ApiError>, number>({
    mutationFn: employeeApi.deleteMRA,
  })
  const deleteMRA = () => {
    const loadingStateToast = toast.info(t("deleteLoadingToastText"))
    deleteMRAMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success(t("deleteSuccessToastText"))
        queryClient.invalidateQueries({
          queryKey: ["employee-main-research-area", {
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
        <p className="font-bold text-xl">{t("mainResearchAreaText")}</p>
        {isCurrentUserProfile &&
          <div className="cursor-pointer">
            <FaPlus color="blue" onClick={() => addNewMRA()} />
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
              onClick={() => deleteMRA()}
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
        {mraState.map((mra, index) =>
          !mra.editMode
            ?
            <MRADisplay
              key={mra.id}
              mra={mra}
              isCurrentUserProfile={isCurrentUserProfile}
              enableEditMode={() => {
                const mraTemp = mraState.map((v, i) => i == index ? { ...v, editMode: true } : v)
                setMRAState([...mraTemp])
              }
              }
              onDeleteClick={() => {
                setIsDeleteDialogOpen(true)
                setToBeDeletedID(mra.id)
              }}
            />
            :
            <MRAEdit
              key={mra.id}
              mra={mra}
              locale={locale}
              index={index}
              employeeID={employeeID}
              disableEditMode={() => {
                const mraTemp = mraState.map((v, i) => i == index ? { ...v, editMode: false } : v)
                setMRAState([...mraTemp])
              }}
              removeNewMRAOnCancel={() => {
                const mraTemp = mraState.filter((_, i) => i != index)
                setMRAState([...mraTemp])
              }}
            />
        )}
      </div>
    </div>
  )
}

interface MRADisplayProps {
  mra: EmployeeMainResearchArea | undefined
  isCurrentUserProfile: boolean
  enableEditMode: () => void
  onDeleteClick: () => void
}

function MRADisplay({
  mra,
  isCurrentUserProfile,
  enableEditMode,
  onDeleteClick,
}: MRADisplayProps) {
  if (!mra) return null
  const t = useTranslations("Employee.MRA")

  return (
    <div className="flex flex-col space-y-1  border-b-1 pb-2">
      <div className="flex justify-between items-center border-gray-500">
        <p className="font-semibold text-xl">{t("displayAreaLabelText")} {mra.area}</p>
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
        <div className="flex space-x-2 items-center">
          <h4 className="font-semibold text-lg">{t("displayDisciplineLabelText")}</h4>
          <div className="px-3 py-2 bg-gray-300 rounded-xl">{mra.discipline}</div>
        </div>
        <div>
          <h4 className="font-semibold text-lg">{t("displayKeyTopicsLabelText")}</h4>
          <div className="px-6">
            <ol className="list-decimal">
              {mra.keyTopics && mra.keyTopics.map((kt, i) => (
                <li key={i}>{kt.keyTopicTitle}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MRAEditProps {
  mra: EmployeeMainResearchArea | undefined
  employeeID: number
  index: number
  locale: string
  disableEditMode: () => void
  removeNewMRAOnCancel: () => void
}

function MRAEdit({
  mra,
  employeeID,
  index,
  locale,
  disableEditMode,
  removeNewMRAOnCancel,
}: MRAEditProps) {
  if (!mra) return null
  const t = useTranslations("Employee.MRA")

  const queryClient = useQueryClient()
  const createMRAMutation = useMutation<EmployeeMainResearchArea, AxiosError<ApiError>, EmployeeMainResearchArea>({
    mutationFn: employeeApi.createMRA,
  })
  const updateMRAMutation = useMutation<EmployeeMainResearchArea, AxiosError<ApiError>, EmployeeMainResearchArea>({
    mutationFn: employeeApi.updateMRA,
  })

  const form = useFormik({
    initialValues: {
      ...mra,
      keyTopics: mra.keyTopics ?? [],
    },
    validationSchema: yup.object({
      area: yup
        .string()
        .required(t("areaValidationRequiredText")),
      discipline: yup
        .string()
        .required(t("disciplineValidationRequiredText")),
      keyTopics: yup
        .array().of(
          yup.object({
            keyTopicTitle: yup
              .string()
              .required(t("keyTopicTitleValidationRequiredText"))
          })
        )
    }),
    onSubmit: (values) => {
      if (values.id === 0) {
        const loadingStateToast = toast.info(t("createLoadingToastText"))
        createMRAMutation.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success(t("createSuccessToastText"))
            queryClient.invalidateQueries({
              queryKey: ["employee-main-research-area", {
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
      updateMRAMutation.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success(t("updateSuccessToastText"))
          queryClient.invalidateQueries({
            queryKey: ["employee-main-research-area", {
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

  const addKeyTopic = () => {
    form.setFieldValue('keyTopics', [
      ...form.values.keyTopics,
      {
        id: 0,
        keyTopicTitle: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
  }

  const deleteKeyTopic = (ktIndex: number) => {
    const kts = form.values.keyTopics.filter((_, i) => i != ktIndex)
    form.setFieldValue('keyTopics', kts)
  }

  const onCancelClick = (id: number) => {
    if (id === 0) {
      removeNewMRAOnCancel()
      return
    }

    disableEditMode()
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex flex-col space-y-2 border-b-1 pb-2">
      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_area]`} className="font-semibold">{t("areaLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_area`}
          name={`area`}
          value={form.values.area}
          onChange={form.handleChange}
        />
        {form.errors.area && form.touched.area && (
          //@ts-ignore
          <div className="text-red-500 font-bold text-sm">{form.errors.area}</div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor={`${index}_discipline]`} className="font-semibold">{t("disciplineLabelText")}</label>
        <input
          type="text"
          className="border p-2 rounded-xl border-gray-400 bg-gray-300"
          id={`${index}_discipline`}
          name={`discipline`}
          value={form.values.discipline}
          onChange={form.handleChange}
        />
        {form.errors.discipline && form.touched.discipline && (
          //@ts-ignore
          <div className="text-red-500 font-bold text-sm">{form.errors.area}</div>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">{t("keyTopicsTitleLabelText")}</label>
        <div className="flex flex-col space-y-2">
          {form.values.keyTopics && form.values.keyTopics.map((kt, i) => (
            <div className="flex flex-col gap-y-2" key={i}>
              <div className="flex space-x-4 items-center">
                <input
                  type="text"
                  className="border p-2 rounded-xl border-gray-400 bg-gray-300 w-full"
                  id={`keyTopics[${i}].keyTopicTitle`}
                  name={`keyTopics[${i}].keyTopicTitle`}
                  value={kt.keyTopicTitle}
                  onChange={form.handleChange}
                />
                <div>
                  <FaTrash
                    color="red"
                    className="cursor-pointer"
                    onClick={() => deleteKeyTopic(i)}
                  />
                </div>
              </div>
              {form.errors.keyTopics && form.touched.keyTopics && form.errors.keyTopics[i] && form.touched.keyTopics[i] && (
                //@ts-ignore
                <div key={i} className="text-red-500 font-bold text-sm">{form.errors.keyTopics[i].keyTopicTitle}</div>
              )}
            </div>
          ))}
          <div className="flex justify-center ">
            <FaPlusCircle
              color="blue"
              size={32}
              className="cursor-pointer"
              onClick={() => addKeyTopic()}
            />
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
          onClick={() => onCancelClick(mra.id)}
        >
          {t("cancelButtonText")}
        </button>
      </div>

    </form>
  )
}