"use client"

import { employeeApi } from "@/api/employee"
import { ApiError } from "@/api/types"
import Dialog from "@/components/Dialog"
import { EmployeeMainResearchArea } from "@/types/employee"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useFormik } from "formik"
import { FormEvent, Fragment, useEffect, useState } from "react"
import { FaPen, FaPlus, FaPlusCircle, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import * as yup from "yup"

interface Props {
  mainResearchAreas: EmployeeMainResearchArea[]
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

  const editModeFormData = useFormik({
    initialValues: {
      mainResearchArea: [...mainResearchArea.map(v => ({ ...v, editMode: false }))]
    },
    onSubmit: _ => { }
  })

  const addNewMRA = () => {
    const mra = mraState.find(v => v.id === 0)
    if (mra) {
      toast.info(("finishCurrentNewEntry"))
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
    const loadingStateToast = toast.info(("deleteLoadingToastText"))
    deleteMRAMutation.mutate(toBeDeletedID, {
      onSettled: () => {
        toast.dismiss(loadingStateToast)
      },
      onSuccess: () => {
        toast.success(("deleteSuccessToastText"))
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
          toast.error(`{t("deleteErrorToastText")} - ${error.response.data.message}`)
        } else {
          toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
        }
      }
    })
  }

  const onCancelClick = (index: number, id: number) => {
    const findByID = mainResearchArea.find(v => v.id == id)
    if (!findByID) {
      const mainResearchAreas = editModeFormData.values.mainResearchArea.filter((_, i) => i != index)
      editModeFormData.setFieldValue("mainResearchArea", mainResearchAreas)
      return
    }

    editModeFormData.setFieldValue(`mainResearchArea[${index}]`, {
      ...findByID,
      editMode: false,
    })
  }

  return (
    <div className="bg-gray-100 rounded-xl py-4">
      <div className="flex justify-between border-b-1 border-gray-500 pb-2 px-6">
        <p className="font-bold text-xl">Основная область исследований</p>
        <div className="cursor-pointer">
          <FaPlus color="blue" onClick={() => addNewMRA()} />
        </div>
      </div>
      <div className="flex flex-col space-y-1 px-6">
        <Dialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <h4 className="text-center font-semibold">Вы уверены что хотите удалить?</h4>
          <div className="flex space-x-2 items-center justify-center mt-2">
            <div
              className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white rounded cursor-pointer"
              onClick={() => deleteMRA()}
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
        {editModeFormData.values.mainResearchArea.map((mra, index) => (
          <Fragment key={index}>

            {!mra.editMode
              ?
              <div className="flex flex-col space-y-1  border-b-1 pb-2">

                <div className="flex justify-between items-center border-gray-500">
                  <p className="font-semibold text-xl">Область: {mra.area}</p>
                  <div className="flex space-x-2">
                    <FaPen
                      color="blue"
                      onClick={() => editModeFormData.setFieldValue(`mainResearchArea[${index}].editMode`, true)}
                      className="cursor-pointer"
                    />
                    <FaTrash
                      color="red"
                      onClick={() => {
                        setToBeDeletedIndex(index)
                        setIsDeleteDialogOpen(true)
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex space-x-2 items-center">
                    <h4 className="font-semibold text-lg">Дисциплина:</h4>
                    <div className="px-3 py-2 bg-gray-300 rounded-xl">{mra.discipline}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Ключевые Темы:</h4>
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

              :

              <form onSubmit={(e: FormEvent<HTMLFormElement>) => onFormSubmit(e, index)} className="flex flex-col space-y-2 border-b-1 pb-2">
                <div className="flex flex-col space-y-1">
                  <label htmlFor={`mainResearchArea[${index}.area]`} className="font-semibold">Область</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`mainResearchArea[${index}].area`}
                    name={`mainResearchArea[${index}].area`}
                    value={editModeFormData.values.mainResearchArea[index].area}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor={`mainResearchArea[${index}.discipline]`} className="font-semibold">Дисциплина</label>
                  <input
                    type="text"
                    className="border p-2 rounded-xl border-gray-400 bg-gray-300"
                    id={`mainResearchArea[${index}].discipline`}
                    name={`mainResearchArea[${index}].discipline`}
                    value={editModeFormData.values.mainResearchArea[index].discipline}
                    onChange={editModeFormData.handleChange}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label>Ключевые темы</label>
                  <div className="flex flex-col space-y-2">
                    {mra.keyTopics && mra.keyTopics.map((kt, i) => (
                      <div className="flex space-x-4 items-center" key={i}>
                        <input
                          type="text"
                          className="border p-2 rounded-xl border-gray-400 bg-gray-300 w-full"
                          id={`mainResearchArea[${index}].keyTopics[${i}].keyTopicTitle`}
                          name={`mainResearchArea[${index}].keyTopics[${i}].keyTopicTitle`}
                          value={kt.keyTopicTitle}
                          onChange={editModeFormData.handleChange}
                        />
                        <div>
                          <FaTrash
                            color="red"
                            className="cursor-pointer"
                            onClick={() => deleteKeyTopic(index, i)}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center ">
                      <FaPlusCircle
                        color="blue"
                        size={32}
                        className="cursor-pointer"
                        onClick={() => addKeyTopic(index)}
                      />
                    </div>

                  </div>
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
                    onClick={() => onCancelClick(index, mra.id)}
                  >
                    Отмена
                  </button>
                </div>

              </form>
            }

          </Fragment>
        ))}
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

  return (
    <div className="flex flex-col space-y-1  border-b-1 pb-2">
      <div className="flex justify-between items-center border-gray-500">
        <p className="font-semibold text-xl">Область: {mra.area}</p>
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
          <h4 className="font-semibold text-lg">Дисциплина:</h4>
          <div className="px-3 py-2 bg-gray-300 rounded-xl">{mra.discipline}</div>
        </div>
        <div>
          <h4 className="font-semibold text-lg">Ключевые Темы:</h4>
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
    },
    validationSchema: yup.object({
      area: yup
        .string()
        .required(("areaValidationRequiredText")),
      discipline: yup
        .string()
        .required(("disciplineValidationRequiredText")),
      keyTopics: yup
        .array().of(
          yup.object({
            keyTopicTitle: yup
              .string()
              .required(("keyTopicTitleValidationRequiredText"))
          })
        )
    }),
    onSubmit: (values) => {
      if (values.id === 0) {
        const loadingStateToast = toast.info(("createLoadingToastText"))
        createMRAMutation.mutate(values, {
          onSettled: () => {
            toast.dismiss(loadingStateToast)
          },
          onSuccess: () => {
            toast.success(("createSuccessToastText"))
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
              toast.error(`{t("createErrorToastText")} - ${error.response.data.message}`)
            } else {
              toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
            }
          }
        })
        return

      }

      const loadingStateToast = toast.info(("updateLoadingToastText"))
      updateMRAMutation.mutate(values, {
        onSettled: () => {
          toast.dismiss(loadingStateToast)
        },
        onSuccess: () => {
          toast.success(("updateSuccessToastText"))
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
            toast.error(`{t("updateErrorToastText")} - ${error.response.data.message}`)
          } else {
            toast(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
          }
        }
      })

    }
  })


  const onCancelClick = (id: number) => {
    if (id === 0) {
      removeNewMRAOnCancel()
      return
    }

    disableEditMode()
  }

  return ()
}